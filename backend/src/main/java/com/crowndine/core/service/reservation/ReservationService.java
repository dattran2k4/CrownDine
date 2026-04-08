package com.crowndine.core.service.reservation;

import com.crowndine.presentation.dto.response.PageResponse;
import com.crowndine.presentation.dto.response.ReservationHistoryResponse;
import com.crowndine.presentation.dto.response.ReservationResponse;
import com.crowndine.core.entity.Reservation;

import com.crowndine.common.enums.EReservationStatus;

import java.time.LocalDate;

public interface ReservationService {
    PageResponse<ReservationResponse> getAllReservations(LocalDate fromDate, LocalDate toDate, EReservationStatus status, int page, int size);

    PageResponse<ReservationHistoryResponse> getReservationHistory(String username, int page, int size);

    Reservation getReservationByCode(String code);

    Reservation getReservationById(Long reservationId);
}
