package com.crowndine.core.service.reservation;

import com.crowndine.presentation.dto.request.ReservationCreateRequest;
import com.crowndine.presentation.dto.request.StaffReservationCreateRequest;
import com.crowndine.presentation.dto.request.ReservationUpdateTableRequest;
import com.crowndine.presentation.dto.response.ReservationCheckoutResponse;
import com.crowndine.core.entity.Reservation;

public interface ReservationLifecycleService {
    ReservationCheckoutResponse createReservationByCustomer(String username, ReservationCreateRequest request);

    ReservationCheckoutResponse createWalkInReservationByStaff(String staffUsername, StaffReservationCreateRequest request);

    void checkInReservation(Long reservationId, String username);

    void cancelReservation(Long reservationId, String username);

    void cancelReservationByStaff(Long reservationId, String username);

    void markReservationNoShow(Long reservationId, String username);

    void completeReservation(Long reservationId, String username);

    ReservationCheckoutResponse updateReservationTable(Long reservationId, ReservationUpdateTableRequest request, String username);

    void confirmAfterDepositPaid(Reservation reservation);
}
