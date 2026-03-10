package com.crowndine.dto.response;

import com.fasterxml.jackson.annotation.JsonFormat;
import lombok.Builder;
import lombok.Getter;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

/**
 * Bảng chấm công theo tuần: từ ngày - đến ngày, danh sách ca, và grid (shiftId, workDate) -> danh sách nhân viên + status.
 * FE có thể render: rows = shifts, cols = days; cell = list employees với status.
 */
@Builder
@Getter
public class TimekeepingScheduleResponse {
    @JsonFormat(pattern = "yyyy-MM-dd")
    private LocalDate weekStart;
    @JsonFormat(pattern = "yyyy-MM-dd")
    private LocalDate weekEnd;
    private Integer weekNumber;
    private Integer year;
    private List<ShiftResponse> shifts;
    /** Key: "shiftId_workDate" (e.g. "1_2026-01-19"), Value: list of employee + status for that cell */
    private List<TimekeepingScheduleCellResponse> cells;

    @Builder
    @Getter
    public static class TimekeepingScheduleCellResponse {
        private Long shiftId;
        @JsonFormat(pattern = "yyyy-MM-dd")
        private LocalDate workDate;
        private String dayOfWeek;
        private String dateShort;   // "19/1"
        private List<EmployeeWithStatusResponse> employees;
    }

    @Builder
    @Getter
    public static class EmployeeWithStatusResponse {
        private Long userId;
        private String staffCode;
        private String fullName;
        private String status; // EAttendanceStatus.name()
    }
}
