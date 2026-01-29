package com.crowndine.service.impl.reservation;

import com.crowndine.dto.response.OrderDetailPageResponse;
import com.crowndine.dto.response.OrderLineResponse;
import com.crowndine.dto.response.PageResponse;
import com.crowndine.dto.response.ReservationHistoryResponse;
import com.crowndine.exception.ResourceNotFoundException;
import com.crowndine.model.Order;
import com.crowndine.model.OrderDetail;
import com.crowndine.model.Reservation;
import com.crowndine.model.User;
import com.crowndine.repository.OrderDetailRepository;
import com.crowndine.repository.ReservationRepository;
import com.crowndine.repository.UserRepository;
import com.crowndine.service.reservation.ReservationService;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j(topic = "RESERVATION-SERVICE")
public class ReservationServiceImpl implements ReservationService {
    private final ReservationRepository reservationRepository;
    private final UserRepository userRepository;
    private final OrderDetailRepository orderDetailRepository;

    @Override
    public PageResponse<ReservationHistoryResponse> getReservationHistory(String username, Pageable pageable) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        Page<Reservation> page = reservationRepository.findByCustomer_Id(user.getId(), pageable);

        List<ReservationHistoryResponse> data = page.getContent().stream()
                .map(this::toHistoryResponse)
                .toList();

        return PageResponse.<ReservationHistoryResponse>builder()
                .pageNumber(page.getNumber())
                .pageSize(page.getSize())
                .totalElements(page.getTotalElements())
                .totalPages(page.getTotalPages())
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

    public OrderDetailPageResponse getReservationOrderDetails(Long reservationId, Pageable pageable) {
        Reservation reservation = reservationRepository.findById(reservationId)
                .orElseThrow(() -> new ResourceNotFoundException("Reservation not found"));

        Order order = reservation.getOrder();
        if (order == null) {
            throw new ResourceNotFoundException("Order not found for reservation");
        }

        Page<OrderDetail> page = orderDetailRepository.findByOrder_Id(order.getId(), pageable);

        List<OrderLineResponse> data = page.getContent().stream()
                .map(this::toLineResponse)
                .toList();

        PageResponse<OrderLineResponse> itemPage = PageResponse.<OrderLineResponse>builder()
                .pageNumber(page.getNumber())
                .pageSize(page.getSize())
                .totalElements(page.getTotalElements())
                .totalPages(page.getTotalPages())
                .data(data)
                .build();

        OrderDetailPageResponse resp = new OrderDetailPageResponse();
        resp.setOrderId(order.getId());
        resp.setTableName(order.getRestaurantTable() != null ? order.getRestaurantTable().getName() : null);
        resp.setStatus(order.getStatus());
        resp.setTotalPrice(order.getTotalPrice());
        resp.setDiscountPrice(order.getDiscountPrice());
        resp.setFinalPrice(order.getFinalPrice());
        resp.setCreatedAt(order.getCreatedAt());
        resp.setItems(itemPage);

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

}
