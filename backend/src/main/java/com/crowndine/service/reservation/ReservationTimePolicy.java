package com.crowndine.service.reservation;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;

/**
 * Quy định chung cho thời gian đặt bàn.
 */
public interface ReservationTimePolicy {
    /**
     * Ghép ngày và giờ bắt đầu thành thời điểm đầy đủ.
     */
    LocalDateTime toStartDateTime(LocalDate date, LocalTime startTime);

    /**
     * Tính giờ kết thúc dự kiến từ giờ bắt đầu.
     */
    LocalDateTime calculatePlannedEndTime(LocalDateTime startDateTime);

    /**
     * Tính giờ kết thúc thực tế từ dữ liệu reservation đã lưu.
     */
    LocalDateTime calculatePlannedEndTime(LocalDateTime startDateTime, LocalTime endTime);

    /**
     * Kiểm tra giờ bắt đầu có hợp lệ hay không.
     */
    void validateStartTime(LocalDateTime startDateTime);
}
