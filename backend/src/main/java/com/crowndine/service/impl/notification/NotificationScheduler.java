package com.crowndine.service.impl.notification;

import com.crowndine.common.enums.EReservationStatus;
import com.crowndine.model.Reservation;
import com.crowndine.repository.ReservationRepository;
import com.crowndine.service.notification.NotificationService;
import com.crowndine.service.reservation.ReservationTimePolicy;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j(topic = "NOTIFICATION-SCHEDULER")
public class NotificationScheduler {

    private static final long RESERVATION_REMINDER_LEAD_HOURS = 3;
    private static final long RESERVATION_REMINDER_WINDOW_MINUTES = 30;

    private final ReservationRepository reservationRepository;
    private final ReservationTimePolicy reservationTimePolicy;
    private final NotificationService notificationService;

    /**
     * Gửi nhắc lịch đặt bàn trước khoảng 3 tiếng.
     */
    @Scheduled(fixedRate = 1800000) //30 phút
    public void sendReservationReminders() {
        LocalDateTime now = LocalDateTime.now();
        LocalDate reservationDate = now.toLocalDate();
        LocalDateTime reminderWindowStart = now.plusHours(RESERVATION_REMINDER_LEAD_HOURS);
        LocalDateTime reminderWindowEnd = reminderWindowStart.plusMinutes(RESERVATION_REMINDER_WINDOW_MINUTES);

        List<Reservation> candidates = reservationRepository.findReminderCandidates(EReservationStatus.CONFIRMED, reservationDate);

        List<Reservation> reservationsToRemind = candidates.stream()
                .filter(reservation -> isInReminderWindow(reservation, reminderWindowStart, reminderWindowEnd))
                .toList();

        reservationsToRemind.forEach(reservation -> notificationService.notifyReservationReminder(reservation.getId()));

        long reminderCount = reservationsToRemind.size();

        if (reminderCount > 0) {
            log.info("Sent {} reservation reminder notifications", reminderCount);
        }
    }

    /**
     * Kiểm tra reservation có nằm trong cửa sổ nhắc hay không.
     */
    private boolean isInReminderWindow(Reservation reservation, LocalDateTime reminderWindowStart, LocalDateTime reminderWindowEnd) {
        if (reservation.getDate() == null || reservation.getStartTime() == null) {
            return false;
        }

        LocalDateTime reservationStartTime = reservationTimePolicy.toStartDateTime(reservation.getDate(), reservation.getStartTime());
        return !reservationStartTime.isBefore(reminderWindowStart) && reservationStartTime.isBefore(reminderWindowEnd);
    }
}
