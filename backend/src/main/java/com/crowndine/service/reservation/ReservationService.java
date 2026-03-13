package com.crowndine.service.reservation;

import com.crowndine.dto.request.*;
import com.crowndine.dto.response.OrderDetailHistoryResponse;
import com.crowndine.dto.response.PageResponse;
import com.crowndine.dto.response.ReservationCreateResponse;
import com.crowndine.dto.response.ReservationHistoryResponse;
import com.crowndine.dto.response.ReservationResponse;
import com.crowndine.dto.response.ReservationHistoryResponse;
import com.crowndine.model.Reservation;

import com.crowndine.common.enums.EReservationStatus;
import java.time.LocalDate;

public interface ReservationService {
    PageResponse<ReservationResponse> getAllReservations(LocalDate fromDate, LocalDate toDate, EReservationStatus status, int page, int size);

    PageResponse<ReservationHistoryResponse> getReservationHistory(String username, int page, int size);

    OrderDetailHistoryResponse getReservationOrderDetails(Long reservationId);

    ReservationCreateResponse createReservation(String username, ReservationCreateRequest request);

    void addItemsToReservationOrder(Long reservationId, OrderItemBatchRequest request, String username);

    Reservation getReservationByCode(String code);

    void addItemToReservationOrder(Long reservationId, OrderItemRequest request, String name);

    void updateItemInReservation(Long reservationId, OrderItemRequest request, String name);

    Reservation getReservationById(Long reservationId);

    void removeItemFromReservation(Long reservationId, OrderItemRemoveRequest request, String name);

    void cancelReservation(Long reservationId, String username);

    void updateReservationTable(Long reservationId, ReservationUpdateTableRequest request, String username);
}