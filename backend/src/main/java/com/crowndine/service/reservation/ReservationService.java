package com.crowndine.service.reservation;

import com.crowndine.dto.response.PageResponse;
import com.crowndine.dto.response.ReservationHistoryResponse;
import com.crowndine.dto.response.ReservationResponse;
import com.crowndine.model.Reservation;

import com.crowndine.common.enums.EReservationStatus;

import java.time.LocalDate;

public interface ReservationService {
    PageResponse<ReservationResponse> getAllReservations(LocalDate fromDate, LocalDate toDate, EReservationStatus status, int page, int size);

    PageResponse<ReservationHistoryResponse> getReservationHistory(String username, int page, int size);

    Reservation getReservationByCode(String code);

    Reservation getReservationById(Long reservationId);
}
