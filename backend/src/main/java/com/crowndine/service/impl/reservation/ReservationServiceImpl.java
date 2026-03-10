package com.crowndine.service.impl.reservation;

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
import com.crowndine.service.reservation.ReservationService;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;
import java.util.UUID;

import static com.crowndine.service.impl.CalculationServiceImpl.DEPOSIT_RATE;

@Service
@RequiredArgsConstructor
@Slf4j(topic = "RESERVATION-SERVICE")
public class ReservationServiceImpl implements ReservationService {
    private static final LocalTime OPEN_TIME = LocalTime.of(9, 0);
    private static final LocalTime CLOSE_TIME = LocalTime.of(22, 0);
    private static final long HOLD_TABLE_MINUTES = 10;

    private final ReservationRepository reservationRepository;
    private final UserRepository userRepository;
    private final OrderDetailRepository orderDetailRepository;
    private final RestaurantTableRepository tableRepository;
    private final PaymentRepository paymentRepository;

    private final CalculationService calculationService;
    private final OrderService orderService;

    @Override
    public PageResponse<ReservationHistoryResponse> getReservationHistory(String username, int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Order.desc("date"), Sort.Order.desc("startTime"), Sort.Order.desc("createdAt")));
        User user = getUserByUserName(username);

        Page<Reservation> reservationPage = reservationRepository.findByCustomer_Id(user.getId(), pageable);

        List<ReservationHistoryResponse> data = reservationPage.getContent().stream().map(this::toHistoryResponse).toList();

        return PageResponse.<ReservationHistoryResponse>builder().page(reservationPage.getNumber() + 1).pageSize(reservationPage.getSize()).totalPages(reservationPage.getTotalPages()).totalItems(reservationPage.getTotalElements()).data(data).build();
    }

    private ReservationHistoryResponse toHistoryResponse(Reservation r) {
        ReservationHistoryResponse resp = new ReservationHistoryResponse();
        resp.setReservationId(r.getId());
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
        }

        return resp;
    }

    public OrderDetailHistoryResponse getReservationOrderDetails(Long reservationId) {
        Reservation reservation = reservationRepository.findById(reservationId).orElseThrow(() -> new ResourceNotFoundException("Reservation not founded"));

        Order order = reservation.getOrder();
        // Tự động tạo order trống nếu chưa có (khi khách không chọn món)
        if (order == null) {
            if (reservation.getCustomer() == null) {
                throw new ResourceNotFoundException("Customer not found for reservation");
        }
            order = orderService.createOrderForReservation(reservation, reservation.getCustomer());
            reservation.setOrder(order);
            reservationRepository.save(reservation);
        }

        // Use the unified mapping to ensure response contains:
        // itemsTotal, tableDeposit (base_deposit * hours), depositAmount (20% items + tableDeposit), remainingAmount, and items.
        return toOrderDetailPageResponse(order, reservation.getStartTime(), reservation.getEndTime());
    }

    private OrderLineResponse toLineResponse(OrderDetail od) {
        OrderLineResponse r = new OrderLineResponse();
        r.setOrderDetailId(od.getId());
        r.setName(od.getProductName());
        r.setType(od.getCombo() != null ? "COMBO" : "ITEM");
        r.setQuantity(od.getQuantity());
        r.setTotalPrice(od.getTotalPrice());

        if (od.getCombo() != null) {
            r.setUnitPrice(od.getCombo().getPrice());
        } else if (od.getItem() != null) {
            r.setUnitPrice(od.getItem().getPrice());
        }

        return r;
    }

    private AvailableTableResponse toAvailableTableResponse(RestaurantTable table) {
        AvailableTableResponse resp = new AvailableTableResponse();
        resp.setId(table.getId());
        resp.setName(table.getName());
        resp.setCapacity(table.getCapacity());
        resp.setShape(table.getShape());
        resp.setX(table.getPositionX());
        resp.setY(table.getPositionY());
        resp.setWidth(table.getWidth());
        resp.setHeight(table.getHeight());
        resp.setRotation(table.getRotation());
        resp.setBaseDeposit(table.getBaseDeposit());
        if (table.getArea() != null) {
            resp.setAreaId(table.getArea().getId());
            resp.setAreaName(table.getArea().getName());
            if (table.getArea().getFloor() != null) {
                resp.setFloorId(table.getArea().getFloor().getId());
                resp.setFloorName(table.getArea().getFloor().getName());
                resp.setFloorNumber(table.getArea().getFloor().getFloorNumber());
            }
        }
        return resp;
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public ReservationCreateResponse createReservation(String username, ReservationCreateRequest request) {
        LocalDateTime startDateTime = LocalDateTime.of(request.getDate(), request.getStartTime());
        LocalDateTime endDateTime = LocalDateTime.of(request.getDate(), request.getEndTime());
        validateReservationTime(startDateTime, endDateTime);

        User user = getUserByUserName(username);

        RestaurantTable table = tableRepository.findById(request.getTableId()).orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy bàn"));

        if (table.getStatus().equals(ETableStatus.UNAVAILABLE)) {
            throw new InvalidDataException("Bàn không khả dụng");
        }

        if (table.getCapacity() != null && table.getCapacity() < request.getGuestNumber()) {
            throw new InvalidDataException("Số lượng khách vượt quá sức chứa của bàn");
        }

        List<EReservationStatus> blockingStatuses = List.of(EReservationStatus.PENDING, EReservationStatus.CONFIRMED, EReservationStatus.CHECKED_IN);

        LocalDateTime now = LocalDateTime.now();
        List<Long> reservedIds = reservationRepository.findReservedTableIds(request.getDate(), request.getStartTime(), request.getEndTime(), blockingStatuses, now);

        if (reservedIds.contains(table.getId())) {
            throw new InvalidDataException("Bàn đã được đặt trong khung giờ này");
        }

        Reservation reservation = new Reservation();
        reservation.setDate(request.getDate());
        reservation.setStartTime(request.getStartTime());
        reservation.setEndTime(request.getEndTime());
        reservation.setGuestNumber(request.getGuestNumber());
        reservation.setNote(request.getNote());
        reservation.setStatus(EReservationStatus.PENDING);
        reservation.setExpiratedAt(now.plusMinutes(HOLD_TABLE_MINUTES));
        reservation.setCustomer(user);
        reservation.setCode(UUID.randomUUID().toString());
        reservation.setTable(table);

        Reservation saved = reservationRepository.save(reservation);
        log.info("Reservation has been saved with id: {}", saved.getId());

        // Tính tiền cọc theo giờ
        BigDecimal tableDeposit = getTableDeposit(table, saved.getStartTime(), saved.getEndTime());
        
        ReservationCreateResponse response = new ReservationCreateResponse();
        response.setReservationId(saved.getId());
        response.setDate(saved.getDate());
        response.setStartTime(saved.getStartTime());
        response.setEndTime(saved.getEndTime());
        response.setGuestNumber(saved.getGuestNumber());
        response.setNote(saved.getNote());
        response.setDepositAmount(tableDeposit);
        response.setStatus(saved.getStatus());
        response.setExpiratedAt(saved.getExpiratedAt());
        response.setTableName(table.getName());
        response.setCode(saved.getCode());
        if (table.getArea() != null && table.getArea().getFloor() != null) {
            response.setFloorNumber(table.getArea().getFloor().getFloorNumber());
        }
        return response;
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public void addItemsToReservationOrder(Long reservationId, OrderItemBatchRequest request, String username) {
        log.info("Adding order items for reservation id {}", reservationId);

        Reservation reservation = getReservationById(reservationId);
        User user = userRepository.findByUsername(username).orElseThrow(() -> new ResourceNotFoundException("User not found"));

        validateReservationBeforeOrder(reservation, user);

        orderService.addOrderForReservation(reservation, request, user);

        log.info("Items has been added for reservation id: {}", reservation.getId());
    }

    private void validateReservationBeforeOrder(Reservation reservation, User user) {
        validateReservationForUser(reservation, user);

        if (reservation.getStatus().equals(EReservationStatus.CANCELLED)) {
            throw new InvalidDataException("Đặt bàn đã bị hủy");
        }

        if (reservation.getStatus().equals(EReservationStatus.PENDING) && reservation.getExpiratedAt()
                != null && reservation.getExpiratedAt().isBefore(LocalDateTime.now())) {
            throw new InvalidDataException("Đặt bàn đã hết hạn giữ");
        }
    }

    @Override
    public Reservation getReservationByCode(String code) {
        return reservationRepository.findByCode(code).orElseThrow(() -> new ResourceNotFoundException("Reservation not found"));
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
            order = orderService.createOrderForReservation(reservation, user);
            reservation.setOrder(order);
        }

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
        if (!reservation.getCustomer().getId().equals(user.getId())) {
            throw new InvalidDataException("Không có quyền thao tác đặt bàn này");
        }
    }

    private void validateReservationTime(LocalDateTime startDateTime, LocalDateTime endDateTime) {

        if (startDateTime.isBefore(LocalDateTime.now())) {
            throw new InvalidDataException("Ngày giờ bắt đầu phải sau hiện tại");
        }

        if (!endDateTime.isAfter(startDateTime)) {
            throw new InvalidDataException("Giờ kết thúc phải sau giờ bắt đầu");
        }

        if (startDateTime.toLocalTime().isBefore(OPEN_TIME) || endDateTime.toLocalTime().isAfter(CLOSE_TIME)) {
            throw new InvalidDataException("Nhà hàng chỉ mở cửa từ 09:00 đến 22:00");
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
        reservationRepository.save(reservation);
        
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
        
        // Kiểm tra xem bàn mới có bị đặt trong khung giờ này không
        // Loại trừ reservation hiện tại khỏi danh sách reserved
        List<EReservationStatus> blockingStatuses = List.of(EReservationStatus.PENDING, EReservationStatus.CONFIRMED, EReservationStatus.CHECKED_IN);
        LocalDateTime now = LocalDateTime.now();
        List<Long> reservedIds = reservationRepository.findReservedTableIds(
                reservation.getDate(), 
                reservation.getStartTime(), 
                reservation.getEndTime(), 
                blockingStatuses, 
                now
        );
        
        // Loại trừ bàn hiện tại của reservation này (nếu có)
        if (reservation.getTable() != null) {
            reservedIds.remove(reservation.getTable().getId());
        }
        
        if (reservedIds.contains(newTable.getId())) {
            throw new InvalidDataException("Bàn đã được đặt trong khung giờ này");
        }
        
        // Cập nhật bàn cho reservation
        reservation.setTable(newTable);
        
        // Cập nhật bàn cho order nếu có
        if (reservation.getOrder() != null) {
            reservation.getOrder().setRestaurantTable(newTable);
        }
        
        reservationRepository.save(reservation);
        
        log.info("Reservation id {} table updated to table id {}", reservationId, request.getTableId());
    }

    /**
     * Tính tiền cọc bàn theo giờ
     * @param table Bàn
     * @param startTime Thời gian bắt đầu
     * @param endTime Thời gian kết thúc
     * @return Tiền cọc = baseDeposit * số giờ
     */
    private BigDecimal getTableDeposit(RestaurantTable table, LocalTime startTime, LocalTime endTime) {
        if (table == null || table.getBaseDeposit() == null) {
            return BigDecimal.ZERO;
        }
        
        if (startTime == null || endTime == null) {
            return table.getBaseDeposit();
        }
        
        // Tính số giờ (có thể là số thập phân)
        long minutes = java.time.Duration.between(startTime, endTime).toMinutes();
        BigDecimal hours = BigDecimal.valueOf(minutes).divide(BigDecimal.valueOf(60), 2, RoundingMode.HALF_UP);
        
        // Tiền cọc = baseDeposit * số giờ
        return table.getBaseDeposit().multiply(hours).setScale(2, RoundingMode.HALF_UP);
    }

    private OrderDetailHistoryResponse toOrderDetailPageResponse(Order order, LocalTime startTime, LocalTime endTime) {
        List<OrderDetail> orderDetails = orderDetailRepository.findByOrder_Id(order.getId());
        List<OrderLineResponse> data = orderDetails.stream()
                .map(this::toLineResponse)
                .toList();

        BigDecimal itemsTotal = orderDetails.stream()
                .map(OrderDetail::getTotalPrice)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        BigDecimal tableDeposit = getTableDeposit(order.getRestaurantTable(), startTime, endTime);
        BigDecimal depositAmount = calculationService.calculateDepositPayment(itemsTotal, tableDeposit);
        BigDecimal remainingAmount = itemsTotal.subtract(itemsTotal.multiply(DEPOSIT_RATE))
                .setScale(2, RoundingMode.HALF_UP);

        OrderDetailHistoryResponse resp = new OrderDetailHistoryResponse();
        resp.setOrderId(order.getId());
        resp.setTableName(order.getRestaurantTable() != null ? order.getRestaurantTable().getName() : null);
        resp.setStatus(order.getStatus());
        resp.setTotalPrice(order.getTotalPrice()); // tổng tiền = tiền món + tiền cọc bàn
        resp.setDiscountPrice(order.getDiscountPrice()); // tiền giảm giá
        resp.setFinalPrice(order.getFinalPrice()); // tổng tiền sau giảm giá
        resp.setItemsTotal(itemsTotal); // tổng tiền các món
        resp.setTableDeposit(tableDeposit); // tiền cọc bàn (theo giờ)
        resp.setDepositAmount(depositAmount); // tiền cọc trước = 20% món + cọc bàn
        resp.setRemainingAmount(remainingAmount); // 80% còn lại trả sau
        resp.setCreatedAt(order.getCreatedAt());
        resp.setItems(data);
        return resp;
    }
}
