package com.crowndine.service.reservation;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;
import java.util.Set;

/**
 * Kiểm tra bàn có còn đặt được hay không.
 */
public interface ReservationAvailabilityService {
    /**
     * Trả về danh sách bàn đang bị chặn tại khung giờ yêu cầu.
     */
    Set<Long> findBlockedTableIds(LocalDate date, LocalTime startTime, List<Long> tableIds);

    /**
     * Kiểm tra bàn có còn trống hay không.
     */
    void ensureTableAvailable(LocalDate date, LocalTime startTime, Long tableId);

    /**
     * Kiểm tra bàn có còn trống hay không, bỏ qua reservation hiện tại nếu cần.
     */
    void ensureTableAvailable(LocalDate date, LocalTime startTime, Long tableId, Long excludedReservationId);
}
