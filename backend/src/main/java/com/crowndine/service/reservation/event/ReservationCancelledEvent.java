package com.crowndine.service.reservation.event;

public record ReservationCancelledEvent(Long reservationId, Long orderId) {
}
