package com.crowndine.controller;

import com.crowndine.dto.request.TimekeepingRecordRequest;
import com.crowndine.dto.response.ApiResponse;
import com.crowndine.dto.response.AttendanceSummaryResponse;
import com.crowndine.dto.response.EmployeeTimekeepingInfoResponse;
import com.crowndine.dto.response.TimekeepingScheduleResponse;
import com.crowndine.dto.response.TimekeepingStatusLegendResponse;
import com.crowndine.service.timekeeping.TimekeepingService;
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
import java.util.List;

/**
 * API chấm công: bảng chấm công theo tuần, lưu chấm công, lịch sử, tổng hợp theo nhân viên, legend trạng thái.
 */
@RestController
@Validated
@RequiredArgsConstructor
@RequestMapping("/api/timekeeping")
@Slf4j(topic = "API-TIMEKEEPING-CONTROLLER")
@PreAuthorize("hasAnyAuthority('ADMIN', 'STAFF')")
public class ApiTimekeepingController {

    private final TimekeepingService timekeepingService;

    /**
     * Bảng chấm công theo tuần (xem theo ca).
     * GET /api/timekeeping/schedule?date=2026-01-20&search=Hùng
     */
    @GetMapping("/schedule")
    public ApiResponse getWeeklySchedule(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date,
            @RequestParam(required = false) String search) {
        TimekeepingScheduleResponse data = timekeepingService.getWeeklySchedule(date, search);
        return ApiResponse.builder()
                .status(200)
                .message("Lấy bảng chấm công theo tuần thành công")
                .data(data)
                .build();
    }

    /**
     * Legend trạng thái chấm công (Đúng giờ, Đi muộn/Về sớm, ...).
     * GET /api/timekeeping/status-legend
     */
    @GetMapping("/status-legend")
    public ApiResponse getStatusLegend() {
        List<TimekeepingStatusLegendResponse> data = timekeepingService.getStatusLegend();
        return ApiResponse.builder()
                .status(200)
                .message("OK")
                .data(data)
                .build();
    }

    /**
     * Lịch sử chấm công của một nhân viên (có phân trang).
     * GET /api/timekeeping/history/{userId}?page=0&size=10
     */
    @GetMapping("/history/{userId}")
    public ApiResponse getHistory(@PathVariable Long userId, Pageable pageable) {
        return ApiResponse.builder()
                .status(200)
                .message("Lấy lịch sử chấm công thành công")
                .data(timekeepingService.getHistory(userId, pageable))
                .build();
    }

    /**
     * Lưu chấm công (form Chấm công: ngày, ca, ghi chú, hình thức, giờ vào/ra).
     * POST /api/timekeeping/record
     */
    @PostMapping("/record")
    public ApiResponse saveRecord(@Valid @RequestBody TimekeepingRecordRequest request) {
        timekeepingService.saveRecord(request);
        return ApiResponse.builder()
                .status(HttpStatus.CREATED.value())
                .message("Lưu chấm công thành công")
                .build();
    }

    /**
     * Tổng hợp chấm công theo nhân viên trong tuần (xem theo nhân viên).
     * GET /api/timekeeping/summary?date=2026-01-20&search=Lan
     */
    @GetMapping("/summary")
    public ApiResponse getAttendanceSummary(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date,
            @RequestParam(required = false) String search) {
        AttendanceSummaryResponse data = timekeepingService.getAttendanceSummary(date, search);
        return ApiResponse.builder()
                .status(200)
                .message("Lấy tổng hợp chấm công thành công")
                .data(data)
                .build();
    }

    /**
     * Thông tin nhân viên + trạng thái chấm công hiện tại (cho header modal Chấm công).
     * GET /api/timekeeping/employee/{userId}/info
     */
    @GetMapping("/employee/{userId}/info")
    public ApiResponse getEmployeeTimekeepingInfo(@PathVariable Long userId) {
        EmployeeTimekeepingInfoResponse data = timekeepingService.getEmployeeTimekeepingInfo(userId);
        return ApiResponse.builder()
                .status(200)
                .message("OK")
                .data(data)
                .build();
    }
}
