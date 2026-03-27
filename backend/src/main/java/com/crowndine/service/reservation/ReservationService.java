package com.crowndine.service.reservation;

import com.crowndine.dto.request.*;
import com.crowndine.dto.response.PageResponse;
import com.crowndine.dto.response.ReservationCreateResponse;
import com.crowndine.dto.response.ReservationHistoryResponse;
import com.crowndine.dto.response.ReservationResponse;
import com.crowndine.model.Reservation;

import com.crowndine.common.enums.EReservationStatus;

import java.time.LocalDate;

public interface ReservationService {
    PageResponse<ReservationResponse> getAllReservations(LocalDate fromDate, LocalDate toDate, EReservationStatus status, int page, int size);

    PageResponse<ReservationHistoryResponse> getReservationHistory(String username, int page, int size);

    ReservationCreateResponse createReservation(String username, ReservationCreateRequest request);

    Reservation getReservationByCode(String code);

    void checkInReservation(Long reservationId, String username);

    Reservation getReservationById(Long reservationId);

    void cancelReservation(Long reservationId, String username);

    void cancelReservationByStaff(Long reservationId, String username);

    void markReservationNoShow(Long reservationId, String username);

    void completeReservation(Long reservationId, String username);

    void updateReservationTable(Long reservationId, ReservationUpdateTableRequest request, String username);

    void confirmAfterDepositPaid(Reservation reservation);
}
