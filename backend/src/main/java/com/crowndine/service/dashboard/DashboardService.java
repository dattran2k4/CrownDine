package com.crowndine.service.dashboard;

import com.crowndine.dto.response.DashboardSalesResponse;

public interface DashboardService {
    DashboardSalesResponse getTodaySalesResults(String viewMode, String timeRange);
}
