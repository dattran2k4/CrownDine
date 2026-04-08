package com.crowndine.presentation.dto.response;

import com.fasterxml.jackson.annotation.JsonFormat;
import lombok.Builder;
import lombok.Getter;

import java.time.LocalDate;
import java.util.List;

@Builder
@Getter
public class AttendanceScheduleResponse {
    @JsonFormat(pattern = "yyyy-MM-dd")
    private LocalDate weekStart;
    @JsonFormat(pattern = "yyyy-MM-dd")
    private LocalDate weekEnd;
    private Integer weekNumber;
    private Integer year;
    private List<ShiftResponse> shifts;
    private List<AttendanceScheduleCellResponse> cells;

    @Builder
    @Getter
    public static class AttendanceScheduleCellResponse {
        private Long shiftId;
        @JsonFormat(pattern = "yyyy-MM-dd")
        private LocalDate workDate;
        private String dayOfWeek;
        private String dateShort;
        private List<AttendanceScheduleEmployeeResponse> employees;
    }

    @Builder
    @Getter
    public static class AttendanceScheduleEmployeeResponse {
        private Long userId;
        private String staffCode;
        private String fullName;
        private String status;
    }
}
