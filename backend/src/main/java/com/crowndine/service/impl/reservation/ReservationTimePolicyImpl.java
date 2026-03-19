package com.crowndine.service.impl.reservation;

import com.crowndine.exception.InvalidDataException;
import com.crowndine.service.reservation.ReservationTimePolicy;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;

/**
 * Chứa các rule thời gian chung của reservation.
 */
@Service
public class ReservationTimePolicyImpl implements ReservationTimePolicy {
    private static final long DEFAULT_RESERVATION_DURATION_HOURS = 4;
    private static final LocalTime OPEN_TIME = LocalTime.of(9, 0);
    private static final LocalTime CLOSE_TIME = LocalTime.of(22, 0);

    @Override
    public LocalDateTime toStartDateTime(LocalDate date, LocalTime startTime) {
        return LocalDateTime.of(date, startTime);
    }

    /**
     * Tính giờ kết thúc dự kiến từ giờ bắt đầu.
     */
    @Override
    public LocalDateTime calculatePlannedEndTime(LocalDateTime startDateTime) {
        return startDateTime.plusHours(DEFAULT_RESERVATION_DURATION_HOURS);
    }

    @Override
    public LocalDateTime calculatePlannedEndTime(LocalDateTime startDateTime, LocalTime endTime) {
        LocalDateTime plannedEndDateTime = LocalDateTime.of(startDateTime.toLocalDate(), endTime);

        if (!endTime.isAfter(startDateTime.toLocalTime())) {
            plannedEndDateTime = plannedEndDateTime.plusDays(1);
        }

        return plannedEndDateTime;
    }

    @Override
    public void validateStartTime(LocalDateTime startDateTime) {
        if (startDateTime.isBefore(LocalDateTime.now())) {
            throw new InvalidDataException("Ngày giờ bắt đầu phải sau hiện tại");
        }

        if (startDateTime.toLocalTime().isBefore(OPEN_TIME)) {
            throw new InvalidDataException("Giờ bắt đầu phải sau giờ mở cửa của nhà hàng");
        }

        if (!startDateTime.toLocalTime().isBefore(CLOSE_TIME)) {
            throw new InvalidDataException("Không thể đặt bàn vào giờ đóng cửa của nhà hàng");
        }
    }
}
