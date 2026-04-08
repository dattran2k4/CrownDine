package com.crowndine.presentation.dto.response;

import com.crowndine.common.enums.EPointReason;
import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
@Builder
public class PointHistoryResponse {
    private Long id;
    private Integer pointsChanged;
    private EPointReason reason;
    private Long referenceId;
    private LocalDateTime createdAt;
}
