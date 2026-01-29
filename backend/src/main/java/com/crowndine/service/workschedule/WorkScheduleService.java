package com.crowndine.service.workschedule;

import com.crowndine.common.enums.EWorkScheduleStatus;
import com.crowndine.dto.request.WorkScheduleCreateRequest;
import com.crowndine.dto.request.WorkScheduleUpdateRequest;
import com.crowndine.dto.response.WorkScheduleResponse;

import java.time.LocalDate;
import java.util.List;

public interface WorkScheduleService {

    List<WorkScheduleResponse> getWorkSchedules(LocalDate fromDate, LocalDate toDate, LocalDate date, EWorkScheduleStatus status, Long userId, Long shiftId);

    void changeWorkScheduleStatus(Long id, EWorkScheduleStatus status);

    long createWorkSchedule(WorkScheduleCreateRequest request);

    void updateWorkSchedule(WorkScheduleUpdateRequest request, Long id);

    void deleteWorkSchedule(Long id);
}
