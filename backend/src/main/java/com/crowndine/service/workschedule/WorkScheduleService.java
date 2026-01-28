package com.crowndine.service.workschedule;

import com.crowndine.common.enums.EWorkScheduleStatus;
import com.crowndine.dto.response.WorkScheduleResponse;

import java.time.LocalDate;
import java.util.List;

public interface WorkScheduleService {

    List<WorkScheduleResponse> getWorkSchedules(LocalDate fromDate, LocalDate toDate, LocalDate date, EWorkScheduleStatus status, Long userId, Long shiftId);
}
