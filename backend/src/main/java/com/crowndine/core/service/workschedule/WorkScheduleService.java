package com.crowndine.core.service.workschedule;

import com.crowndine.common.enums.EWorkScheduleStatus;
import com.crowndine.presentation.dto.request.WorkScheduleCreateRequest;
import com.crowndine.presentation.dto.request.WorkScheduleUpdateRequest;
import com.crowndine.presentation.dto.response.WorkScheduleResponse;
import com.crowndine.core.entity.WorkSchedule;

import java.time.LocalDate;
import java.util.List;

public interface WorkScheduleService {

    List<WorkScheduleResponse> getWorkSchedules(LocalDate fromDate, LocalDate toDate, LocalDate date,
            EWorkScheduleStatus status, Long userId, Long shiftId);

    void changeWorkScheduleStatus(Long id, EWorkScheduleStatus status);

    long createWorkSchedule(WorkScheduleCreateRequest request);

    void reassignWorkSchedules(WorkScheduleUpdateRequest request, Long id);

    void deleteWorkSchedule(Long id, Boolean deletePattern, LocalDate workDate);

    WorkSchedule getWorkSchedule(Long id);
}
