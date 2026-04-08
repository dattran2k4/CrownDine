package com.crowndine.presentation.dto.response;

import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
@Builder
public class VoucherAssignmentResponse {
    private Long assignmentId;
    private Long voucherId;
    private String voucherCode;
    private Long customerId;
    private String username;
    private String fullName;
    private Integer usageCount;
    private Integer usageLimit;
    private LocalDateTime assignedAt;
    private LocalDateTime expiredAt;
}
