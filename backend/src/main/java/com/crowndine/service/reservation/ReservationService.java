package com.crowndine.service.reservation;

import com.crowndine.dto.request.ReservationCreateRequest;
import com.crowndine.dto.response.AvailableTableResponse;
import com.crowndine.dto.response.OrderDetailPageResponse;
import com.crowndine.dto.response.PageResponse;
import com.crowndine.dto.response.ReservationCreateResponse;
import com.crowndine.dto.response.ReservationHistoryResponse;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

public interface ReservationService {
    PageResponse<ReservationHistoryResponse> getReservationHistory(String username, int page, int size);
    OrderDetailPageResponse getReservationOrderDetails(Long reservationId);

    List<AvailableTableResponse> findAvailableTables(
            LocalDate date,
            LocalTime startTime,
            LocalTime endTime,
            Integer guestNumber
    );

    ReservationCreateResponse createReservation(String username, ReservationCreateRequest request);
}