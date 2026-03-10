package com.crowndine.dto.response;

import com.crowndine.common.enums.EAttendanceStatus;
import lombok.Builder;
import lombok.Getter;

/**
 * Thông tin nhân viên + trạng thái chấm công hiện tại (cho header modal Chấm công: "Đúng giờ").
 */
@Builder
@Getter
public class EmployeeTimekeepingInfoResponse {
    private Long userId;
    private String staffCode;
    private String fullName;
    private EAttendanceStatus currentStatus;
    private String currentStatusLabel;
}
