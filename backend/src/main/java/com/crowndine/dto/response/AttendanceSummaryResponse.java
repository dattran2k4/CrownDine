package com.crowndine.dto.response;

import lombok.Builder;
import lombok.Getter;

import java.util.List;

/**
 * Bảng chấm công xem theo nhân viên: mỗi nhân viên có tổng hợp Đi làm, Nghỉ làm, Đi muộn, Về sớm, Làm thêm.
 */
@Builder
@Getter
public class AttendanceSummaryResponse {
    /** Tuần (hoặc khoảng ngày) đang xem */
    private String periodLabel; // e.g. "Tuần 4 - Th. 01 2026"
    private List<EmployeeAttendanceSummaryResponse> employees;

    @Builder
    @Getter
    public static class EmployeeAttendanceSummaryResponse {
        private Long userId;
        private String staffCode;
        private String fullName;
        /** Số ca đi làm, tổng giờ */
        private int workShiftCount;
        private String workHoursTotal;   // "7.5 giờ"
        /** Số ca nghỉ */
        private int leaveShiftCount;
        /** Số lần đi muộn, tổng thời gian muộn */
        private int lateCount;
        private String lateDuration;    // "0h 15p"
        /** Số lần về sớm, tổng thời gian */
        private int earlyLeaveCount;
        private String earlyLeaveDuration;
        /** Làm thêm (số giờ hoặc mô tả) */
        private String overtime;
        /** true nếu nhân viên không có dữ liệu chấm công trong kỳ */
        private boolean noData;
    }
}
