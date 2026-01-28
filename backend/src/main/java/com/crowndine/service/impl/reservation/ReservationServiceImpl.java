package com.crowndine.service.impl.reservation;

import com.crowndine.dto.response.PageResponse;
import com.crowndine.dto.response.ReservationHistoryResponse;
import com.crowndine.exception.ResourceNotFoundException;
import com.crowndine.model.Order;
import com.crowndine.model.Reservation;
import com.crowndine.model.User;
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

    public ReservationHistoryResponse toHistoryResponse(Reservation r) {
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
}
