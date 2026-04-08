package com.crowndine.core.service.reservation.event;

public record ReservationCancelledEvent(Long reservationId, Long orderId) {
}
