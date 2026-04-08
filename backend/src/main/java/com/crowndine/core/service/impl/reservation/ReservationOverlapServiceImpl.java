package com.crowndine.core.service.impl.reservation;

import com.crowndine.common.enums.EReservationStatus;
import com.crowndine.core.entity.Reservation;
import com.crowndine.core.service.reservation.ReservationOverlapService;
import com.crowndine.core.service.reservation.ReservationTimePolicy;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

/**
 * So sánh khung giờ yêu cầu với reservation đang có.
 */
@Service
@RequiredArgsConstructor
public class ReservationOverlapServiceImpl implements ReservationOverlapService {
    private final ReservationTimePolicy reservationTimePolicy;

    /**
     * Trả về true khi reservation hiện tại vẫn chặn khung giờ mới.
     */
    @Override
    public boolean isBlockingReservation(Reservation reservation, LocalDateTime requestedStartDateTime) {
        if (reservation.getCheckedOutAt() != null || reservation.getStatus() == EReservationStatus.COMPLETED) {
            return false;
        }

        LocalDateTime requestedEndDateTime = reservationTimePolicy.calculatePlannedEndTime(requestedStartDateTime);
        LocalDateTime existingStartDateTime = reservationTimePolicy.toStartDateTime(reservation.getDate(), reservation.getStartTime());
        LocalDateTime existingEndDateTime = reservationTimePolicy.calculatePlannedEndTime(existingStartDateTime, reservation.getEndTime());

        return requestedStartDateTime.isBefore(existingEndDateTime)
                && requestedEndDateTime.isAfter(existingStartDateTime);
    }
}
