package com.crowndine.service.impl.reservation;

import com.crowndine.common.enums.EReservationStatus;
import com.crowndine.common.enums.ETableStatus;
import com.crowndine.dto.request.ReservationCreateRequest;
import com.crowndine.dto.response.*;
import com.crowndine.exception.InvalidDataException;
import com.crowndine.exception.ResourceNotFoundException;
import com.crowndine.model.*;
import com.crowndine.repository.OrderDetailRepository;
import com.crowndine.repository.ReservationRepository;
import com.crowndine.repository.RestaurantTableRepository;
import com.crowndine.repository.UserRepository;
import com.crowndine.service.reservation.ReservationService;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

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

    @Override
    public PageResponse<ReservationHistoryResponse> getReservationHistory(String username, int page, int size) {
        Pageable pageable = PageRequest.of(
                page,
                size,
                Sort.by(
                        Sort.Order.desc("date"),
                        Sort.Order.desc("startTime"),
                        Sort.Order.desc("createdAt")
                )
        );
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        Page<Reservation> reservationPage = reservationRepository.findByCustomer_Id(user.getId(), pageable);

        List<ReservationHistoryResponse> data = reservationPage.getContent().stream()
                .map(this::toHistoryResponse)
                .toList();

        return PageResponse.<ReservationHistoryResponse>builder()
                .page(reservationPage.getNumber() + 1)
                .pageSize(reservationPage.getSize())
                .totalPages(reservationPage.getTotalPages())
                .totalItems(reservationPage.getTotalElements())
                .data(data)
                .build();
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

    public OrderDetailPageResponse getReservationOrderDetails(Long reservationId) {
        Reservation reservation = reservationRepository.findById(reservationId)
                .orElseThrow(() -> new ResourceNotFoundException("Reservation not found"));

        Order order = reservation.getOrder();
        if (order == null) {
            throw new ResourceNotFoundException("Order not found for reservation");
        }

        List<OrderDetail> orderDetails = orderDetailRepository.findByOrder_Id(order.getId());

        List<OrderLineResponse> data = orderDetails.stream()
                .map(this::toLineResponse)
                .toList();

        OrderDetailPageResponse resp = new OrderDetailPageResponse();
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
    public List<AvailableTableResponse> findAvailableTables(
            LocalDate date,
            LocalTime startTime,
            LocalTime endTime,
            Integer guestNumber
    ) {
        validateReservationTime(date, startTime, endTime, true);
        if (guestNumber == null || guestNumber < 1) {
            throw new InvalidDataException("Số lượng khách phải lớn hơn 0");
        }

        List<RestaurantTable> candidates =
                tableRepository.findByCapacityGreaterThanEqualAndStatusOrderByCapacityAsc(
                        guestNumber, ETableStatus.AVAILABLE
                );

        if (candidates.isEmpty()) {
            return List.of();
        }

        List<EReservationStatus> blockingStatuses = List.of(
                EReservationStatus.PENDING,
                EReservationStatus.CONFIRMED,
                EReservationStatus.CHECKED_IN
        );

        LocalDateTime now = LocalDateTime.now();
        List<Long> reservedIds =
                reservationRepository.findReservedTableIds(date, startTime, endTime, blockingStatuses, now);

        Set<Long> reservedSet = new HashSet<>(reservedIds);

        return candidates.stream()
                .filter(t -> !reservedSet.contains(t.getId()))
                .map(this::toAvailableTableResponse)
                .toList();
    }

    private AvailableTableResponse toAvailableTableResponse(RestaurantTable table) {
        AvailableTableResponse resp = new AvailableTableResponse();
        resp.setId(table.getId());
        resp.setName(table.getName());
        resp.setCapacity(table.getCapacity());
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
        validateReservationTime(request.getDate(), request.getStartTime(), request.getEndTime(), true);

        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy người dùng"));

        RestaurantTable table = tableRepository.findById(request.getTableId())
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy bàn"));

        if (table.getStatus() != ETableStatus.AVAILABLE) {
            throw new InvalidDataException("Bàn không khả dụng");
        }

        if (table.getCapacity() != null && table.getCapacity() < request.getGuestNumber()) {
            throw new InvalidDataException("Số lượng khách vượt quá sức chứa của bàn");
        }

        List<EReservationStatus> blockingStatuses = List.of(
                EReservationStatus.PENDING,
                EReservationStatus.CONFIRMED,
                EReservationStatus.CHECKED_IN
        );

        LocalDateTime now = LocalDateTime.now();
        List<Long> reservedIds = reservationRepository.findReservedTableIds(
                request.getDate(),
                request.getStartTime(),
                request.getEndTime(),
                blockingStatuses,
                now
        );

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
        response.setStatus(saved.getStatus());
        response.setExpiratedAt(saved.getExpiratedAt());
        response.setTableName(table.getName());
        if (table.getArea() != null && table.getArea().getFloor() != null) {
            response.setFloorNumber(table.getArea().getFloor().getFloorNumber());
        }
        return response;
    }

    private void validateReservationTime(
            LocalDate date,
            LocalTime startTime,
            LocalTime endTime,
            boolean requireFutureStart
    ) {
        if (date == null || startTime == null || endTime == null) {
            throw new InvalidDataException("Ngày và thời gian là bắt buộc");
        }
        if (!endTime.isAfter(startTime)) {
            throw new InvalidDataException("Giờ kết thúc phải sau giờ bắt đầu");
        }
        if (startTime.isBefore(OPEN_TIME) || endTime.isAfter(CLOSE_TIME)) {
            throw new InvalidDataException("Nhà hàng chỉ mở cửa từ 09:00 đến 22:00");
        }
        if (!requireFutureStart) {
            return;
        }
        LocalDate today = LocalDate.now();
        if (date.isBefore(today)) {
            throw new InvalidDataException("Không thể đặt bàn trong quá khứ");
        }
        if (date.isEqual(today)) {
            LocalTime now = LocalTime.now();
            if (!startTime.isAfter(now)) {
                throw new InvalidDataException("Không thể đặt bàn trong quá khứ");
            }
        }
    }
}
