package com.crowndine.controller;

import com.crowndine.dto.request.AttendanceRecordRequest;
import com.crowndine.dto.response.ApiResponse;
import com.crowndine.dto.response.AttendanceScheduleResponse;
import com.crowndine.dto.response.AttendanceSummaryResponse;
import com.crowndine.dto.response.EmployeeAttendanceInfoResponse;
import com.crowndine.service.attendance.AttendanceService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Pageable;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;

@RestController
@Validated
@RequiredArgsConstructor
@RequestMapping("/api/attendances")
@Slf4j(topic = "API-ATTENDANCE-CONTROLLER")
@PreAuthorize("hasAnyAuthority('ADMIN', 'STAFF')")
public class ApiAttendanceController {

    private final AttendanceService attendanceService;

    @GetMapping("/schedule")
    public ApiResponse getWeeklySchedule(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date,
            @RequestParam(required = false) String search) {
        AttendanceScheduleResponse data = attendanceService.getWeeklySchedule(date, search);
        return ApiResponse.builder()
                .status(200)
                .message("Lấy bảng chấm công theo tuần thành công")
                .data(data)
                .build();
    }

    @GetMapping("/history/{userId}")
    public ApiResponse getHistory(@PathVariable Long userId, Pageable pageable) {
        return ApiResponse.builder()
                .status(200)
                .message("Lấy lịch sử chấm công thành công")
                .data(attendanceService.getHistory(userId, pageable))
                .build();
    }

    @PostMapping("/record")
    public ApiResponse saveRecord(@Valid @RequestBody AttendanceRecordRequest request) {
        attendanceService.saveRecord(request);
        return ApiResponse.builder()
                .status(HttpStatus.CREATED.value())
                .message("Lưu chấm công thành công")
                .build();
    }

    @GetMapping("/summary")
    public ApiResponse getAttendanceSummary(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date,
            @RequestParam(required = false) String search) {
        AttendanceSummaryResponse data = attendanceService.getAttendanceSummary(date, search);
        return ApiResponse.builder()
                .status(200)
                .message("Lấy tổng hợp chấm công thành công")
                .data(data)
                .build();
    }

    @GetMapping("/employee/{userId}/info")
    public ApiResponse getEmployeeAttendanceInfo(@PathVariable Long userId) {
        EmployeeAttendanceInfoResponse data = attendanceService.getEmployeeAttendanceInfo(userId);
        return ApiResponse.builder()
                .status(200)
                .message("OK")
                .data(data)
                .build();
    }
}
