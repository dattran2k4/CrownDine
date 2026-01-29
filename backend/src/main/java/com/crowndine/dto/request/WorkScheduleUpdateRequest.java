package com.crowndine.dto.request;

import com.crowndine.common.enums.EWorkScheduleStatus;
import lombok.Getter;

import java.time.LocalDate;

@Getter
public class WorkScheduleUpdateRequest {
    private Long staffId;
    private Long shiftId;
    private LocalDate workDate;
}
