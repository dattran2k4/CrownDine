package com.crowndine.core.service.attendance;

import com.crowndine.presentation.dto.request.AttendanceRecordRequest;
import com.crowndine.presentation.dto.response.*;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.time.LocalDate;

public interface AttendanceService {

    void saveRecord(AttendanceRecordRequest request);

    Page<AttendanceHistoryItemResponse> getHistory(Long userId, Pageable pageable);

    AttendanceScheduleResponse getWeeklySchedule(LocalDate date, String searchName);

    AttendanceSummaryResponse getAttendanceSummary(LocalDate date, String searchName);

    EmployeeAttendanceInfoResponse getEmployeeAttendanceInfo(Long userId);
}
