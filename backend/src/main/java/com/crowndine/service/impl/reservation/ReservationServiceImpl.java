package com.crowndine.service.impl.reservation;

import com.crowndine.common.enums.EOrderStatus;
import com.crowndine.common.enums.EReservationStatus;
import com.crowndine.common.enums.ETableStatus;
import com.crowndine.dto.request.*;
import com.crowndine.dto.response.*;
import com.crowndine.exception.InvalidDataException;
import com.crowndine.exception.ResourceNotFoundException;
import com.crowndine.model.*;
import com.crowndine.repository.*;
import com.crowndine.service.CalculationService;
import com.crowndine.service.order.OrderService;
import com.crowndine.service.reservation.ReservationAvailabilityService;
import com.crowndine.service.reservation.ReservationTimePolicy;
import com.crowndine.service.reservation.ReservationService;
import com.crowndine.service.reservation.event.ReservationCancelledEvent;
import com.crowndine.service.reservation.event.ReservationConfirmedEvent;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.*;
import java.util.stream.Collectors;
import java.util.UUID;

import static com.crowndine.service.impl.CalculationServiceImpl.DEPOSIT_RATE;

@Service
@RequiredArgsConstructor
@Slf4j(topic = "RESERVATION-SERVICE")
public class ReservationServiceImpl implements ReservationService {
    private static final long HOLD_TABLE_MINUTES = 10;

    private final ReservationRepository reservationRepository;
    private final UserRepository userRepository;
    private final OrderDetailRepository orderDetailRepository;
    private final RestaurantTableRepository tableRepository;
    private final OrderRepository orderRepository;
    private final FeedbackRepository feedbackRepository;

    private final CalculationService calculationService;
    private final OrderService orderService;
    private final ReservationTimePolicy reservationTimePolicy;
    private final ReservationAvailabilityService reservationAvailabilityService;
    private final ApplicationEventPublisher eventPublisher;

    @Override
    public PageResponse<ReservationResponse> getAllReservations(LocalDate fromDate, LocalDate toDate, EReservationStatus status, int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Order.desc("date"), Sort.Order.desc("startTime")));
        Page<Reservation> reservationPage = reservationRepository.findReservations(fromDate, toDate, status, pageable);

        List<ReservationResponse> data = reservationPage.getContent().stream().map(this::toReservationResponse).toList();

        return PageResponse.<ReservationResponse>builder()
                .page(reservationPage.getNumber() + 1)
                .pageSize(reservationPage.getSize())
                .totalPages(reservationPage.getTotalPages())
                .totalItems(reservationPage.getTotalElements())
                .data(data)
                .build();
    }

    private ReservationResponse toReservationResponse(Reservation r) {
        ReservationResponse resp = new ReservationResponse();
        resp.setId(r.getId());
        resp.setCode(r.getCode());
        resp.setDate(r.getDate());
        resp.setStartTime(r.getStartTime());
        resp.setEndTime(r.getEndTime());
        resp.setGuestNumber(r.getGuestNumber());
        resp.setNote(r.getNote());
        resp.setStatus(r.getStatus());
        resp.setTableName(r.getTable() != null ? r.getTable().getName() : null);

        if (r.getUser() != null) {
            resp.setCustomerName(r.getUser().getFullName());
            resp.setPhone(r.getUser().getPhone());
            resp.setEmail(r.getUser().getEmail());
        }

        if (r.getOrder() != null) {
            resp.setOrderId(r.getOrder().getId());
            List<OrderDetail> orderDetails = orderDetailRepository.findByOrder_Id(r.getOrder().getId());
            List<OrderDetailResponse> odResponses = orderDetails.stream().map(this::toOrderDetailResponse).toList();
            resp.setOrderDetails(odResponses);
        } else {
            resp.setOrderId(null);
            resp.setOrderDetails(List.of());
        }

        return resp;
    }

    private OrderDetailResponse toOrderDetailResponse(OrderDetail od) {
        OrderDetailResponse r = new OrderDetailResponse();
        r.setId(od.getId());
        r.setQuantity(od.getQuantity());
        r.setNote(od.getNote());
        r.setStatus(od.getStatus());
        r.setTotalPrice(od.getTotalPrice());

        if (od.getItem() != null) {
            ItemResponse ir = ItemResponse.builder()
                    .id(od.getItem().getId())
                    .name(od.getItem().getName())
                    .price(od.getItem().getPrice())
                    .build();
            r.setItem(ir);
        }

        if (od.getCombo() != null) {
            ComboResponse cr = ComboResponse.builder()
                    .id(od.getCombo().getId())
                    .name(od.getCombo().getName())
                    .price(od.getCombo().getPrice())
                    .build();
            r.setCombo(cr);
        }

        return r;
    }

    @Override
    public PageResponse<ReservationHistoryResponse> getReservationHistory(String username, int page, int size) {
        User user = getUserByUserName(username);

        // Fetch all reservations
        List<Reservation> reservations = reservationRepository.findAllByUser_Id(user.getId());
        List<ReservationHistoryResponse> resHistory = reservations.stream()
                .map(this::toHistoryResponse)
                .toList();

        // Fetch all standalone orders (orders not linked to a reservation)
        List<Order> standaloneOrders = orderRepository.findAllByUser_IdAndReservationIsNull(user.getId());
        List<ReservationHistoryResponse> orderHistory = standaloneOrders.stream()
                .map(this::fromStandaloneOrderToHistoryResponse)
                .toList();

        // Merge both lists
        List<ReservationHistoryResponse> allHistory = new ArrayList<>(resHistory);
        allHistory.addAll(orderHistory);

        // Sort by date (descending) and then startTime (descending)
        allHistory.sort((a, b) -> {
            int dateComp = b.getDate().compareTo(a.getDate());
            if (dateComp != 0) return dateComp;

            LocalTime timeA = a.getStartTime() != null ? a.getStartTime() : LocalTime.MIN;
            LocalTime timeB = b.getStartTime() != null ? b.getStartTime() : LocalTime.MIN;
            return timeB.compareTo(timeA);
        });

        // Manual pagination
        int totalItems = allHistory.size();
        int totalPages = (int) Math.ceil((double) totalItems / size);
        int fromIndex = page * size;
        int toIndex = Math.min(fromIndex + size, totalItems);

        List<ReservationHistoryResponse> pagedData = (fromIndex < totalItems)
                ? allHistory.subList(fromIndex, toIndex)
                : Collections.emptyList();

        return PageResponse.<ReservationHistoryResponse>builder()
                .page(page + 1)
                .pageSize(size)
                .totalPages(totalPages)
                .totalItems(totalItems)
                .data(pagedData)
                .build();
    }

    private ReservationHistoryResponse toHistoryResponse(Reservation r) {
        ReservationHistoryResponse resp = new ReservationHistoryResponse();
        resp.setReservationId(r.getId());
        resp.setReservationCode(r.getCode());
        resp.setDate(r.getDate());
        resp.setStartTime(r.getStartTime());
        resp.setEndTime(r.getEndTime());
        resp.setGuestNumber(r.getGuestNumber());
        resp.setReservationStatus(r.getStatus());
        resp.setTableName(r.getTable() != null ? r.getTable().getName() : null);

        Order order = r.getOrder();
        if (order != null) {
            resp.setOrderId(order.getId());
            resp.setOrderStatus(order.getStatus());
            resp.setFinalPrice(order.getFinalPrice());

            List<OrderDetail> details = orderDetailRepository.findByOrder_Id(order.getId());
            resp.setItems(details.stream().map(d -> toLineResponse(d, r.getUser().getId())).toList());

            // Check if user has already given general feedback
            resp.setHasGeneralFeedback(feedbackRepository.existsByUser_IdAndOrder_IdAndOrderDetailIsNull(r.getUser().getId(), order.getId()));
        }

        return resp;
    }

    private ReservationHistoryResponse fromStandaloneOrderToHistoryResponse(Order order) {
        ReservationHistoryResponse resp = new ReservationHistoryResponse();
        resp.setReservationId(null); // No reservation linked
        resp.setReservationCode(null);
        resp.setDate(order.getCreatedAt().toLocalDate());
        resp.setStartTime(order.getCreatedAt().toLocalTime());
        resp.setEndTime(order.getCreatedAt().toLocalTime().plusHours(1)); // Default duration for display
        resp.setGuestNumber(0);

        // Map order status to a placeholder reservation status for display purposes
        if (order.getStatus() == com.crowndine.common.enums.EOrderStatus.COMPLETED) {
            resp.setReservationStatus(EReservationStatus.COMPLETED);
        } else if (order.getStatus() == com.crowndine.common.enums.EOrderStatus.CANCELLED) {
            resp.setReservationStatus(EReservationStatus.CANCELLED);
        } else {
            resp.setReservationStatus(EReservationStatus.CONFIRMED);
        }

        resp.setTableName(order.getRestaurantTable() != null ? order.getRestaurantTable().getName() : "N/A");
        resp.setOrderId(order.getId());
        resp.setOrderStatus(order.getStatus());
        resp.setFinalPrice(order.getFinalPrice());

        List<OrderDetail> details = orderDetailRepository.findByOrder_Id(order.getId());
        resp.setItems(details.stream().map(d -> toLineResponse(d, order.getUser().getId())).toList());

        // Check if user has already given general feedback
        resp.setHasGeneralFeedback(feedbackRepository.existsByUser_IdAndOrder_IdAndOrderDetailIsNull(order.getUser().getId(), order.getId()));
        return resp;
    }

    public OrderDetailHistoryResponse getReservationOrderDetails(Long reservationId) {
        Reservation reservation = reservationRepository.findById(reservationId).orElseThrow(() -> new ResourceNotFoundException("Reservation not founded"));

        Order order = reservation.getOrder();
        if (order == null) {
            return createEmptyOrderDetailResponse(reservation);
        }

        return toOrderDetailPageResponse(order);
    }

    private OrderLineResponse toLineResponse(OrderDetail od, Long userId) {
        OrderLineResponse r = new OrderLineResponse();
        r.setOrderDetailId(od.getId());
        Long itemId = (od.getItem() != null) ? od.getItem().getId() : null;
        r.setProductId(od.getCombo() != null ? od.getCombo().getId() : itemId);
        r.setName(od.getProductName());
        r.setType(od.getCombo() != null ? "COMBO" : "ITEM");
        r.setQuantity(od.getQuantity());
        r.setTotalPrice(od.getTotalPrice());

        if (userId != null) {
            r.setHasFeedback(feedbackRepository.existsByUser_IdAndOrderDetail_Id(userId, od.getId()));
        }

        if (od.getCombo() != null) {
            r.setUnitPrice(od.getCombo().getPrice());
        } else if (od.getItem() != null) {
            r.setUnitPrice(od.getItem().getPrice());
        }

        return r;
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public ReservationCreateResponse createReservation(String username, ReservationCreateRequest request) {
        LocalDateTime startDateTime = reservationTimePolicy.toStartDateTime(request.getDate(), request.getStartTime());
        LocalDateTime endDateTime = reservationTimePolicy.calculatePlannedEndTime(startDateTime);
        reservationTimePolicy.validateStartTime(startDateTime);

        User user = getUserByUserName(username);

        RestaurantTable table = tableRepository.findById(request.getTableId()).orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy bàn"));

        if (table.getStatus().equals(ETableStatus.UNAVAILABLE)) {
            throw new InvalidDataException("Bàn không khả dụng");
        }

        if (table.getCapacity() != null && table.getCapacity() < request.getGuestNumber()) {
            throw new InvalidDataException("Số lượng khách vượt quá sức chứa của bàn");
        }

        reservationAvailabilityService.ensureTableAvailable(request.getDate(), request.getStartTime(), table.getId());

        Reservation reservation = new Reservation();
        reservation.setDate(request.getDate());
        reservation.setStartTime(request.getStartTime());
        reservation.setEndTime(endDateTime.toLocalTime());
        reservation.setCheckedOutAt(null);
        reservation.setGuestNumber(request.getGuestNumber());
        reservation.setNote(request.getNote());
        reservation.setStatus(EReservationStatus.PENDING);
        reservation.setExpiratedAt(LocalDateTime.now().plusMinutes(HOLD_TABLE_MINUTES));
        reservation.setUser(user);
        reservation.setCode(UUID.randomUUID().toString());
        reservation.setTable(table);

        Reservation saved = reservationRepository.save(reservation);
        log.info("Reservation has been saved with id: {}", saved.getId());

        ReservationCreateResponse response = new ReservationCreateResponse();
        response.setReservationId(saved.getId());
        response.setReservationCode(saved.getCode());
        return response;
    }

    @Override
    public Reservation getReservationByCode(String code) {
        return reservationRepository.findByCode(code).orElseThrow(() -> new ResourceNotFoundException("Reservation not found"));
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public void checkInReservation(Long reservationId, String username) {
        log.info("Checking in reservation id {} by user {}", reservationId, username);
        Reservation reservation = getReservationById(reservationId);
        getUserByUserName(username);

        if (reservation.getStatus() == EReservationStatus.CHECKED_IN) {
            throw new InvalidDataException("Đặt bàn này đã được check-in");
        }

        if (reservation.getStatus() != EReservationStatus.CONFIRMED) {
            throw new InvalidDataException("Chỉ có thể check-in đặt bàn ở trạng thái CONFIRMED");
        }

        reservation.setStatus(EReservationStatus.CHECKED_IN);
        reservationRepository.save(reservation);

        if (reservation.getOrder() != null) {
            Order confirmedOrder = orderService.confirmReservationOrder(reservation.getOrder());
            reservation.setOrder(confirmedOrder);
        }

        log.info("Reservation id {} has been checked in successfully", reservationId);
    }

    @Override
    public void addItemToReservationOrder(Long reservationId, OrderItemRequest request, String name) {
        log.info("Adding order item for reservation id {}", reservationId);

        Reservation reservation = getReservationById(reservationId);

        User user = getUserByUserName(name);

        validateReservationForUser(reservation, user);

        Order order = reservation.getOrder();

        //Create order if order null
        if (order == null) {
            order = orderService.createOrderForReservation(reservation, user, resolveReservationOrderStatus(reservation));
            reservation.setOrder(order);
        }
        log.info("Adding order item for order id {}", order.getId());

        orderService.addOrUpdateItemToOrder(order.getId(), request);
    }

    private User getUserByUserName(String name) {
        return userRepository.findByUsername(name).orElseThrow(() -> new ResourceNotFoundException("User not found"));
    }

    @Override
    public void updateItemInReservation(Long reservationId, OrderItemRequest request, String name) {
        log.info("Processing update order item for reservation id {}", reservationId);
        Reservation reservation = getReservationById(reservationId);

        User user = getUserByUserName(name);

        validateReservationForUser(reservation, user);

        Order order = reservation.getOrder();
        orderService.updateOrderItemInReservation(order, request);

    }

    @Override
    public Reservation getReservationById(Long reservationId) {
        return reservationRepository.findById(reservationId).orElseThrow(() -> new ResourceNotFoundException("Reservation not found"));
    }

    @Override
    public void removeItemFromReservation(Long reservationId, OrderItemRemoveRequest request, String name) {
        log.info("Processing remove order item for reservation id {}", reservationId);
        Reservation reservation = getReservationById(reservationId);

        User user = getUserByUserName(name);

        validateReservationForUser(reservation, user);

        orderService.removeOrderItemInReservation(reservation.getOrder(), request);
    }

    private void validateReservationForUser(Reservation reservation, User user) {
        if (reservation.getUser() == null || !reservation.getUser().getId().equals(user.getId())) {
            throw new InvalidDataException("Không có quyền thao tác đặt bàn này");
        }
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public void cancelReservation(Long reservationId, String username) {
        log.info("Cancelling reservation id {} for user {}", reservationId, username);

        Reservation reservation = getReservationById(reservationId);
        User user = getUserByUserName(username);

        validateReservationForUser(reservation, user);

        // Chỉ cho phép cancel reservation ở trạng thái PENDING hoặc CONFIRMED
        if (!reservation.getStatus().equals(EReservationStatus.PENDING) &&
                !reservation.getStatus().equals(EReservationStatus.CONFIRMED)) {
            throw new InvalidDataException("Không thể hủy đặt bàn ở trạng thái này");
        }

        reservation.setStatus(EReservationStatus.CANCELLED);
        if (reservation.getTable() != null) {
            reservation.getTable().setStatus(ETableStatus.AVAILABLE);
        }
        reservationRepository.save(reservation);
        eventPublisher.publishEvent(new ReservationCancelledEvent(reservation.getId(), reservation.getOrder() != null ? reservation.getOrder().getId() : null));

        log.info("Reservation id {} has been cancelled", reservationId);
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public void updateReservationTable(Long reservationId, ReservationUpdateTableRequest request, String username) {
        log.info("Updating table for reservation id {} to table id {} for user {}", reservationId, request.getTableId(), username);

        Reservation reservation = getReservationById(reservationId);
        User user = getUserByUserName(username);

        validateReservationForUser(reservation, user);

        // Chỉ cho phép update table khi reservation ở trạng thái PENDING
        if (!reservation.getStatus().equals(EReservationStatus.PENDING)) {
            throw new InvalidDataException("Chỉ có thể thay đổi bàn khi đặt bàn ở trạng thái PENDING");
        }

        RestaurantTable newTable = tableRepository.findById(request.getTableId())
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy bàn"));

        if (newTable.getStatus().equals(ETableStatus.UNAVAILABLE)) {
            throw new InvalidDataException("Bàn không khả dụng");
        }

        if (newTable.getCapacity() != null && newTable.getCapacity() < reservation.getGuestNumber()) {
            throw new InvalidDataException("Số lượng khách vượt quá sức chứa của bàn");
        }

        reservationAvailabilityService.ensureTableAvailable(
                reservation.getDate(),
                reservation.getStartTime(),
                newTable.getId(),
                reservation.getId()
        );

        // Cập nhật bàn cho reservation
        reservation.setTable(newTable);

        // Cập nhật bàn cho order nếu có
        if (reservation.getOrder() != null) {
            reservation.getOrder().setRestaurantTable(newTable);
        }

        reservationRepository.save(reservation);

        log.info("Reservation id {} table updated to table id {}", reservationId, request.getTableId());
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public void confirmAfterDepositPaid(Reservation reservation) {
        reservation.setStatus(EReservationStatus.CONFIRMED);
        reservation.setExpiratedAt(null);
        reservationRepository.save(reservation);
        eventPublisher.publishEvent(new ReservationConfirmedEvent(reservation.getId()));
        log.info("Reservation id {} status changed to {} and ReservationConfirmedEvent published", reservation.getId(), reservation.getStatus());
    }

    /**
     * Lấy tiền cọc cố định của bàn.
     */
    private BigDecimal getTableDeposit(RestaurantTable table) {
        if (table == null || table.getBaseDeposit() == null) {
            return BigDecimal.ZERO;
        }

        return table.getBaseDeposit().setScale(2, RoundingMode.HALF_UP);
    }

    private OrderDetailHistoryResponse toOrderDetailPageResponse(Order order) {
        List<OrderDetail> orderDetails = orderDetailRepository.findByOrder_Id(order.getId());
        List<OrderLineResponse> data = orderDetails.stream()
                .map(od -> toLineResponse(od, order.getUser() != null ? order.getUser().getId() : null))
                .toList();

        BigDecimal tableDeposit = getTableDeposit(order.getRestaurantTable());
        BigDecimal totalPrice = defaultMoney(order.getTotalPrice());
        BigDecimal discountPrice = defaultMoney(order.getDiscountPrice());
        BigDecimal finalPrice = defaultMoney(order.getFinalPrice());
        BigDecimal itemsTotal = totalPrice;
        BigDecimal depositAmount = calculationService.calculateDepositPayment(finalPrice, tableDeposit);
        BigDecimal remainingAmount = finalPrice.subtract(finalPrice.multiply(DEPOSIT_RATE))
                .setScale(2, RoundingMode.HALF_UP);

        OrderDetailHistoryResponse resp = new OrderDetailHistoryResponse();
        resp.setOrderId(order.getId());
        resp.setTableName(order.getRestaurantTable() != null ? order.getRestaurantTable().getName() : null);
        resp.setStatus(order.getStatus());
        resp.setTotalPrice(totalPrice);
        resp.setDiscountPrice(discountPrice);
        resp.setFinalPrice(finalPrice);
        resp.setItemsTotal(itemsTotal);
        resp.setTableDeposit(tableDeposit);
        resp.setDepositAmount(depositAmount);
        resp.setRemainingAmount(remainingAmount);
        resp.setCreatedAt(order.getCreatedAt());
        resp.setItems(data);
        return resp;
    }

    private EOrderStatus resolveReservationOrderStatus(Reservation reservation) {
        if (reservation.getStatus() == EReservationStatus.CHECKED_IN) {
            return EOrderStatus.CONFIRMED;
        }

        return EOrderStatus.PRE_ORDER;
    }

    private OrderDetailHistoryResponse createEmptyOrderDetailResponse(Reservation reservation) {
        OrderDetailHistoryResponse response = new OrderDetailHistoryResponse();
        response.setOrderId(null);
        response.setTableName(reservation.getTable() != null ? reservation.getTable().getName() : null);
        response.setStatus(resolveReservationOrderStatus(reservation));
        response.setTotalPrice(BigDecimal.ZERO);
        response.setDiscountPrice(BigDecimal.ZERO);
        response.setFinalPrice(BigDecimal.ZERO);
        response.setItemsTotal(BigDecimal.ZERO);
        response.setTableDeposit(getTableDeposit(reservation.getTable()));
        response.setDepositAmount(BigDecimal.ZERO);
        response.setRemainingAmount(BigDecimal.ZERO);
        response.setItems(List.of());
        return response;
    }

    private BigDecimal defaultMoney(BigDecimal amount) {
        return amount != null ? amount : BigDecimal.ZERO;
    }
}
