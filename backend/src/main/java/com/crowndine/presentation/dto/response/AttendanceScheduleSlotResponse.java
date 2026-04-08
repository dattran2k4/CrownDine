package com.crowndine.presentation.dto.response;

import com.crowndine.common.enums.EAttendanceStatus;
import lombok.Builder;
import lombok.Getter;

import java.time.LocalDate;
import java.util.List;

@Builder
@Getter
public class AttendanceScheduleSlotResponse {
    private Long shiftId;
    private String shiftName;
    private String shiftTimeRange;
    private String dayOfWeek;
    private String dateShort;
    private LocalDate workDate;
    private List<AttendanceSlotEmployeeResponse> employees;

    @Builder
    @Getter
    public static class AttendanceSlotEmployeeResponse {
        private Long userId;
        private String staffCode;
        private String fullName;
        private EAttendanceStatus status;
    }
}
