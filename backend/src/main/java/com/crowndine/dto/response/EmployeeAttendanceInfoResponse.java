package com.crowndine.dto.response;

import com.crowndine.common.enums.EAttendanceStatus;
import lombok.Builder;
import lombok.Getter;

@Builder
@Getter
public class EmployeeAttendanceInfoResponse {
    private Long userId;
    private String staffCode;
    private String fullName;
    private EAttendanceStatus currentStatus;
}
