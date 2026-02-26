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
    public ApiResponse getTodaySalesResults() {
        DashboardSalesResponse data = dashboardService.getTodaySalesResults();
        return ApiResponse.builder()
                .status(HttpStatus.OK.value())
                .message("Lấy kết quả bán hàng hôm nay thành công")
                .data(data)
                .build();
    }
}
