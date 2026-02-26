package com.crowndine.service.reservation;

import com.crowndine.dto.request.OrderItemBatchRequest;
import com.crowndine.dto.request.OrderItemRequest;
import com.crowndine.dto.request.ReservationCreateRequest;
import com.crowndine.dto.response.AvailableTableResponse;
import com.crowndine.dto.response.OrderDetailResponse;
import com.crowndine.dto.response.PageResponse;
import com.crowndine.dto.response.ReservationCreateResponse;
import com.crowndine.dto.response.ReservationHistoryResponse;
import com.crowndine.model.Reservation;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

public interface ReservationService {
    PageResponse<ReservationHistoryResponse> getReservationHistory(String username, int page, int size);

    OrderDetailResponse getReservationOrderDetails(Long reservationId);

    ReservationCreateResponse createReservation(String username, ReservationCreateRequest request);

    void addItemsToReservationOrder(Long reservationId, OrderItemBatchRequest request, String username);

    Reservation getReservationByCode(String code);
}