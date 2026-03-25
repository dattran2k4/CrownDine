package com.crowndine.service.order.listener;

import com.crowndine.service.order.OrderService;
import com.crowndine.service.reservation.event.ReservationCancelledEvent;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.transaction.event.TransactionPhase;
import org.springframework.transaction.event.TransactionalEventListener;

@Component
@RequiredArgsConstructor
@Slf4j(topic = "RESERVATION-CANCELLED-EVENT-LISTENER")
public class ReservationCancelledEventListener {

    private final OrderService orderService;

    @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT)
    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public void handle(ReservationCancelledEvent event) {
        log.info("Handling ReservationCancelledEvent for reservation id {} and order id {}", event.reservationId(), event.orderId());

        if (event.orderId() == null) {
            return;
        }

        orderService.cancelPreOrderForReservation(event.orderId());
    }
}
