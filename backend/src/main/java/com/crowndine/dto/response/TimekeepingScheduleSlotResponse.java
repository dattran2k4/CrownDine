package com.crowndine.dto.response;

import com.crowndine.common.enums.EAttendanceStatus;
import lombok.Builder;
import lombok.Getter;

import java.time.LocalDate;
import java.util.List;

/**
 * Một ô trong bảng chấm công theo tuần: (ca, ngày) -> danh sách nhân viên với trạng thái.
 */
@Builder
@Getter
public class TimekeepingScheduleSlotResponse {
    private Long shiftId;
    private String shiftName;
    private String shiftTimeRange; // "08:00 - 12:00"
    private String dayOfWeek;       // "Thứ 2"
    private String date;           // "19/1"
    private LocalDate workDate;    // for API use
    private List<EmployeeSlotResponse> employees;

    @Builder
    @Getter
    public static class EmployeeSlotResponse {
        private Long userId;
        private String staffCode;   // username
        private String fullName;
        private EAttendanceStatus status;
    }
}
