package com.crowndine.controller;

import com.crowndine.dto.response.ApiResponse;
import com.crowndine.dto.response.DashboardSalesResponse;
import com.crowndine.service.dashboard.DashboardService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/dashboard")
@RequiredArgsConstructor
public class ApiDashboardController {

    private final DashboardService dashboardService;

    @GetMapping("/sales-results")
    public ApiResponse getTodaySalesResults(
            @org.springframework.web.bind.annotation.RequestParam(defaultValue = "Theo giờ") String viewMode,
            @org.springframework.web.bind.annotation.RequestParam(defaultValue = "7 ngày qua") String timeRange) {
        DashboardSalesResponse data = dashboardService.getTodaySalesResults(viewMode, timeRange);
        return ApiResponse.builder()
                .status(HttpStatus.OK.value())
                .message("Lấy kết quả bán hàng thành công")
                .data(data)
                .build();
    }

    @GetMapping("/export-sales")
    public org.springframework.http.ResponseEntity<byte[]> exportSalesReport(
            @org.springframework.web.bind.annotation.RequestParam(defaultValue = "7 ngày qua") String timeRange) {
        try {
            byte[] data = dashboardService.exportSalesReport(timeRange);
            org.springframework.http.HttpHeaders headers = new org.springframework.http.HttpHeaders();
            headers.set(org.springframework.http.HttpHeaders.CONTENT_DISPOSITION,
                    "attachment; filename=bao_cao_doanh_thu.xlsx");
            headers.setContentType(org.springframework.http.MediaType
                    .parseMediaType("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"));
            return new org.springframework.http.ResponseEntity<>(data, headers, org.springframework.http.HttpStatus.OK);
        } catch (java.io.IOException e) {
            return new org.springframework.http.ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
}
