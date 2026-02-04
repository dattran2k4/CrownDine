package com.crowndine.service.impl.reservation;

import com.crowndine.common.enums.EOrderStatus;
import com.crowndine.common.enums.EReservationStatus;
import com.crowndine.common.enums.ETableStatus;
import com.crowndine.dto.request.OrderItemBatchRequest;
import com.crowndine.dto.request.OrderItemRequest;
import com.crowndine.dto.request.ReservationCreateRequest;
import com.crowndine.dto.response.*;
import com.crowndine.exception.InvalidDataException;
import com.crowndine.exception.ResourceNotFoundException;
import com.crowndine.model.*;
import com.crowndine.repository.*;
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
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j(topic = "RESERVATION-SERVICE")
public class ReservationServiceImpl implements ReservationService {
    private static final LocalTime OPEN_TIME = LocalTime.of(9, 0);
    private static final LocalTime CLOSE_TIME = LocalTime.of(22, 0);
    private static final long HOLD_TABLE_MINUTES = 10;
    private static final BigDecimal DEPOSIT_RATE = new BigDecimal("0.20");

    private final ReservationRepository reservationRepository;
    private final UserRepository userRepository;
    private final OrderDetailRepository orderDetailRepository;
    private final RestaurantTableRepository tableRepository;
    private final OrderRepository orderRepository;
    private final ItemRepository itemRepository;
    private final ComboRepository comboRepository;

    @Override
    public PageResponse<ReservationHistoryResponse> getReservationHistory(String username, int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Order.desc("date"), Sort.Order.desc("startTime"), Sort.Order.desc("createdAt")));
        User user = userRepository.findByUsername(username).orElseThrow(() -> new ResourceNotFoundException("User not found"));

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

    public OrderDetailResponse getReservationOrderDetails(Long reservationId) {
        Reservation reservation = reservationRepository.findById(reservationId).orElseThrow(() -> new ResourceNotFoundException("Reservation not found"));

        Order order = reservation.getOrder();
        if (order == null) {
            throw new ResourceNotFoundException("Order not found for reservation");
        }

        List<OrderDetail> orderDetails = orderDetailRepository.findByOrder_Id(order.getId());

        List<OrderLineResponse> data = orderDetails.stream().map(this::toLineResponse).toList();

        OrderDetailResponse resp = new OrderDetailResponse();
        resp.setOrderId(order.getId());
        resp.setTableName(order.getRestaurantTable() != null ? order.getRestaurantTable().getName() : null);
        resp.setStatus(order.getStatus());
        resp.setTotalPrice(order.getTotalPrice());
        resp.setDiscountPrice(order.getDiscountPrice());
        resp.setFinalPrice(order.getFinalPrice());
        resp.setCreatedAt(order.getCreatedAt());
        resp.setItems(data);

        return resp;

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

    @Override
    @Transactional(readOnly = true)
    public List<AvailableTableResponse> findAvailableTables(LocalDate date, LocalTime startTime, LocalTime endTime, Integer guestNumber) {
        LocalDateTime startDateTime = LocalDateTime.of(date, startTime);
        LocalDateTime endDateTime = LocalDateTime.of(date, endTime);
        validateReservationTime(startDateTime, endDateTime, true);

        List<RestaurantTable> candidates = tableRepository.findByCapacityGreaterThanEqualAndStatusOrderByCapacityAsc(guestNumber, ETableStatus.AVAILABLE);

        if (candidates.isEmpty()) {
            return List.of();
        }

        List<EReservationStatus> blockingStatuses = List.of(EReservationStatus.PENDING, EReservationStatus.CONFIRMED, EReservationStatus.CHECKED_IN);

        LocalDateTime now = LocalDateTime.now();
        List<Long> reservedIds = reservationRepository.findReservedTableIds(date, startTime, endTime, blockingStatuses, now);

        Set<Long> reservedSet = new HashSet<>(reservedIds);

        return candidates.stream().filter(t -> !reservedSet.contains(t.getId())).map(this::toAvailableTableResponse).toList();
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
        validateReservationTime(startDateTime, endDateTime, true);

        User user = userRepository.findByUsername(username).orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy người dùng"));

        RestaurantTable table = tableRepository.findById(request.getTableId()).orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy bàn"));

        if (table.getStatus() != ETableStatus.AVAILABLE) {
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
        reservation.setTable(table);
        table.setStatus(ETableStatus.RESERVED);

        Reservation saved = reservationRepository.save(reservation);

        ReservationCreateResponse response = new ReservationCreateResponse();
        response.setReservationId(saved.getId());
        response.setDate(saved.getDate());
        response.setStartTime(saved.getStartTime());
        response.setEndTime(saved.getEndTime());
        response.setGuestNumber(saved.getGuestNumber());
        response.setNote(saved.getNote());
        response.setDepositAmount(table.getBaseDeposit());
        response.setStatus(saved.getStatus());
        response.setExpiratedAt(saved.getExpiratedAt());
        response.setTableName(table.getName());
        reservation.setCode(UUID.randomUUID().toString());
        if (table.getArea() != null && table.getArea().getFloor() != null) {
            response.setFloorNumber(table.getArea().getFloor().getFloorNumber());
        }
        return response;
    }

    @Override
    public Reservation getReservationByCode(String code) {
        return reservationRepository.findByCode(code).orElseThrow(() -> new ResourceNotFoundException("Reservation not found"));
    }

    private void validateReservationTime(
            LocalDateTime startDateTime,
            LocalDateTime endDateTime,
            boolean requireFutureStart
    ) {
        if (!endDateTime.isAfter(startDateTime)) {
            throw new InvalidDataException("Giờ kết thúc phải sau giờ bắt đầu");
        }
        if (startDateTime.toLocalTime().isBefore(OPEN_TIME) || endDateTime.toLocalTime().isAfter(CLOSE_TIME)) {
            throw new InvalidDataException("Nhà hàng chỉ mở cửa từ 09:00 đến 22:00");
        }
        if (!requireFutureStart) {
            return;
        }
        LocalDateTime now = LocalDateTime.now();
        if (!startDateTime.isAfter(now)) {
            throw new InvalidDataException("Không thể đặt bàn trong quá khứ");
        }
    }

    @Override
    //đảm bảo tính toàn vẹn dữ liệu khi một method thực hiện nhiều thao tác DB.
    @Transactional(rollbackFor = Exception.class)
    public OrderDetailResponse createOrGetOrder(Long reservationId, String username) {
        Reservation reservation = reservationRepository.findById(reservationId).orElseThrow(() -> new ResourceNotFoundException("Reservation not found"));
        User user = userRepository.findByUsername(username).orElseThrow(() -> new ResourceNotFoundException("User not found"));

        if (!reservation.getCustomer().getId().equals(user.getId())) {
            throw new InvalidDataException("Không có quyền thao tác đặt bàn này");
        }

        //
        if (reservation.getStatus() == EReservationStatus.CANCELLED) {
            throw new InvalidDataException("Đặt bàn đã bị hủy");
        }

        //Đặt bàn chưa bị đổi status nhưng đã hết hạn giữ (scheduler chưa kịp chạy).
        if (reservation.getStatus() == EReservationStatus.PENDING && reservation.getExpiratedAt()
                != null && reservation.getExpiratedAt().isBefore(LocalDateTime.now())) {
            throw new InvalidDataException("Đặt bàn đã hết hạn giữ");
        }

        Order order = reservation.getOrder();
        if (order == null) {
            order = new Order();
            order.setStatus(EOrderStatus.PENDING);
            order.setReservation(reservation);
            order.setUser(user);
            order.setRestaurantTable(reservation.getTable());
            order.setDiscountPrice(BigDecimal.ZERO);
            order.setTotalPrice(BigDecimal.ZERO);
            order.setFinalPrice(BigDecimal.ZERO);
            order = orderRepository.save(order);
            recalculateOrderTotals(order);
        }

        return toOrderDetailPageResponse(order);

    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public OrderDetailResponse addOrderItems(Long reservationId, OrderItemBatchRequest request, String username) {
        OrderDetailResponse orderResp = createOrGetOrder(reservationId, username);
        Order order = orderRepository.findById(orderResp.getOrderId())
                .orElseThrow(() -> new ResourceNotFoundException("Order not found"));

        for (OrderItemRequest itemReq : request.getItems()) {
            boolean hasItem = itemReq.getItemId() != null;
            boolean hasCombo = itemReq.getComboId() != null;
            if (hasItem == hasCombo) {
                throw new InvalidDataException(hasItem
                        ? "Chỉ chọn item hoặc combo"
                        : "Phải chọn item hoặc combo");
            }

            OrderDetail detail = new OrderDetail();
            detail.setOrder(order);
            detail.setQuantity(itemReq.getQuantity());
            detail.setNote(itemReq.getNote());

            BigDecimal unitPrice;
            if (hasItem) {
                Item item = itemRepository.findById(itemReq.getItemId())
                        .orElseThrow(() -> new ResourceNotFoundException("Item not found"));
                detail.setItem(item);
                unitPrice = item.getPriceAfterDiscount() != null ? item.getPriceAfterDiscount() : item.getPrice();
            } else {
                Combo combo = comboRepository.findById(itemReq.getComboId())
                        .orElseThrow(() -> new ResourceNotFoundException("Combo not found"));
                detail.setCombo(combo);
                unitPrice = combo.getPriceAfterDiscount() != null ? combo.getPriceAfterDiscount() : combo.getPrice();
            }
            detail.setTotalPrice(unitPrice.multiply(BigDecimal.valueOf(itemReq.getQuantity())));
            orderDetailRepository.save(detail);
        }
        recalculateOrderTotals(order);
        return toOrderDetailPageResponse(order);
    }

    private void recalculateOrderTotals(Order order) {
        List<OrderDetail> details = orderDetailRepository.findByOrder_Id(order.getId());
        
        // tiền món = tổng tiền của tất cả các món
        BigDecimal itemsTotal = details.stream()
                .map(OrderDetail::getTotalPrice)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal deposit = getTableDeposit(order.getRestaurantTable());

        // tiền thanh toán = tiền đặt cọc + tiền món
        BigDecimal total = itemsTotal.add(deposit);
        order.setTotalPrice(total);

        order.setDiscountPrice(BigDecimal.ZERO);

        // tiền thanh toán = tiền đặt cọc + tiền món - discount
        order.setFinalPrice(total.subtract(order.getDiscountPrice()));
        orderRepository.save(order);
    }

    private BigDecimal getTableDeposit(RestaurantTable table) {
        if (table == null || table.getBaseDeposit() == null) {
            return BigDecimal.ZERO;
        }
        return table.getBaseDeposit();
    }

    private BigDecimal calculateDepositAmount(BigDecimal itemsTotal, BigDecimal tableDeposit) {
        if (itemsTotal == null) {
            itemsTotal = BigDecimal.ZERO;
        }
        if (tableDeposit == null) {
            tableDeposit = BigDecimal.ZERO;
        }
        return itemsTotal.multiply(DEPOSIT_RATE)
                .add(tableDeposit)
                .setScale(2, RoundingMode.HALF_UP);
    }

    private OrderDetailResponse toOrderDetailPageResponse(Order order) {
        List<OrderDetail> orderDetails = orderDetailRepository.findByOrder_Id(order.getId());
        List<OrderLineResponse> data = orderDetails.stream()
                .map(this::toLineResponse)
                .toList();

        BigDecimal itemsTotal = orderDetails.stream()
                .map(OrderDetail::getTotalPrice)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        BigDecimal tableDeposit = getTableDeposit(order.getRestaurantTable());
        BigDecimal depositAmount = calculateDepositAmount(itemsTotal, tableDeposit);
        BigDecimal remainingAmount = itemsTotal.subtract(itemsTotal.multiply(DEPOSIT_RATE))
                .setScale(2, RoundingMode.HALF_UP);

        OrderDetailResponse resp = new OrderDetailResponse();
        resp.setOrderId(order.getId());
        resp.setTableName(order.getRestaurantTable() != null ? order.getRestaurantTable().getName() : null);
        resp.setStatus(order.getStatus());
        resp.setTotalPrice(order.getTotalPrice()); // tổng tiền = tiền món + tiền cọc bàn
        resp.setDiscountPrice(order.getDiscountPrice()); // tiền giảm giá
        resp.setFinalPrice(order.getFinalPrice()); // tổng tiền sau giảm giá
        resp.setItemsTotal(itemsTotal); // tổng tiền các món
        resp.setTableDeposit(tableDeposit); // tiền cọc bàn
        resp.setDepositAmount(depositAmount); // tiền cọc trước = 20% món + cọc bàn
        resp.setRemainingAmount(remainingAmount); // 80% còn lại trả sau
        resp.setCreatedAt(order.getCreatedAt());
        resp.setItems(data);
        return resp;
    }
}
