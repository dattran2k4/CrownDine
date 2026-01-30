package com.crowndine.service.impl.reservation;

import com.crowndine.common.enums.EReservationStatus;
import com.crowndine.model.Reservation;
import com.crowndine.repository.ReservationRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
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

    @Scheduled(fixedRate = 60000)
    @Transactional(rollbackFor = Exception.class)
    public void cancelExpiredReservations() {
        LocalDateTime now = LocalDateTime.now();
        List<Reservation> expired = reservationRepository
                .findByStatusAndExpiratedAtBefore(EReservationStatus.PENDING, now);

        if (expired.isEmpty()) {
            return;
        }

        expired.forEach(reservation -> reservation.setStatus(EReservationStatus.CANCELLED));
        reservationRepository.saveAll(expired);
        log.info("Cancelled {} expired reservations", expired.size());
    }
}
