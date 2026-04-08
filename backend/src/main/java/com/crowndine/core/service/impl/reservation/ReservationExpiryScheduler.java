package com.crowndine.core.service.impl.reservation;

import com.crowndine.common.enums.EReservationStatus;
import com.crowndine.core.entity.Reservation;
import com.crowndine.core.repository.ReservationRepository;
import com.crowndine.core.service.reservation.event.ReservationCancelledEvent;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j(topic = "RESERVATION-EXPIRY-SCHEDULER")
public class ReservationExpiryScheduler {

    private final ReservationRepository reservationRepository;
    private final ApplicationEventPublisher eventPublisher;

    @Scheduled(fixedRate = 60000)
    @Transactional(rollbackFor = Exception.class)
    public void cancelExpiredReservations() {
        LocalDateTime now = LocalDateTime.now();
        List<Reservation> expired = reservationRepository
                .findByStatusAndExpiratedAtBefore(EReservationStatus.PENDING, now);

        if (expired.isEmpty()) {
            return;
        }

        expired.forEach(reservation -> {
            reservation.setStatus(EReservationStatus.CANCELLED);
            if (reservation.getTable() != null) {
                reservation.getTable().setStatus(com.crowndine.common.enums.ETableStatus.AVAILABLE);
            }
            eventPublisher.publishEvent(new ReservationCancelledEvent(reservation.getId(), reservation.getOrder() != null ? reservation.getOrder().getId() : null));
        });
        log.info("Cancelled {} expired reservations", expired.size());
    }
}
