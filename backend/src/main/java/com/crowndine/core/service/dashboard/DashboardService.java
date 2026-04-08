package com.crowndine.core.service.dashboard;

import com.crowndine.presentation.dto.response.DashboardSalesResponse;

public interface DashboardService {
    DashboardSalesResponse getTodaySalesResults(String viewMode, String timeRange);

    byte[] exportSalesReport(String timeRange) throws java.io.IOException;
}
