package com.crowndine.service.reservation.listener;

import com.crowndine.service.notification.NotificationService;
import com.crowndine.service.reservation.event.ReservationConfirmedEvent;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Component;
import org.springframework.transaction.event.TransactionPhase;
import org.springframework.transaction.event.TransactionalEventListener;

@Component
@RequiredArgsConstructor
@Slf4j(topic = "RESERVATION-CONFIRMED-EVENT-LISTENER")
public class ReservationConfirmedEventListener {

    private final NotificationService notificationService;

    /**
     * Tạo notification sau khi reservation đã commit thành công.
     */
    @Async("notificationTaskExecutor")
    @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT)
    public void handle(ReservationConfirmedEvent event) {
        log.info("Handling ReservationConfirmedEvent for reservation id {}", event.reservationId());
        notificationService.notifyReservationConfirmed(event.reservationId());
    }
}
