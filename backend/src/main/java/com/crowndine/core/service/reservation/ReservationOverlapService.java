package com.crowndine.core.service.reservation;

import com.crowndine.core.entity.Reservation;

import java.time.LocalDateTime;

/**
 * Kiểm tra reservation có đang chặn một khung giờ mới hay không.
 */
public interface ReservationOverlapService {
    boolean isBlockingReservation(Reservation reservation, LocalDateTime requestedStartDateTime);
}
