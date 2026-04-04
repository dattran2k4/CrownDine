package com.crowndine.service.reservation;

import com.crowndine.dto.request.ReservationCreateRequest;
import com.crowndine.dto.request.StaffReservationCreateRequest;
import com.crowndine.dto.request.ReservationUpdateTableRequest;
import com.crowndine.dto.response.ReservationCheckoutResponse;
import com.crowndine.model.Reservation;

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
