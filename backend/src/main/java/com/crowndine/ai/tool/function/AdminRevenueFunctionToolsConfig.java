package com.crowndine.ai.tool.function;

import com.crowndine.ai.schema.request.RevenueReportRequest;
import com.crowndine.ai.schema.response.RevenueReportResponse;
import com.crowndine.ai.tool.AIToolNames;
import com.crowndine.dto.response.DashboardSalesResponse;
import com.crowndine.service.dashboard.DashboardService;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Description;

import java.util.function.Function;

@Configuration
public class AdminRevenueFunctionToolsConfig {

    private final DashboardService dashboardService;

    public AdminRevenueFunctionToolsConfig(DashboardService dashboardService) {
        this.dashboardService = dashboardService;
    }

    @Bean(AIToolNames.REVENUE_REPORT_TOOL)
    @Description("Lấy báo cáo doanh thu của nhà hàng CrownDine theo period. Hỗ trợ today, week, month")
    public Function<RevenueReportRequest, RevenueReportResponse> getRevenueReport() {
        return request -> {
            String normalizedPeriod = normalizePeriod(request.period());
            String timeRange = toDashboardTimeRange(normalizedPeriod);
            DashboardSalesResponse sales = dashboardService.getTodaySalesResults("Theo ngày", timeRange);

            return new RevenueReportResponse(
                    normalizedPeriod,
                    sales.getRangeTotalAmount(),
                    "VND",
                    sales.getCompletedOrdersToday(),
                    sales.getRangeTotalCustomers(),
                    summarizeRevenueTrend(sales.getCompletedGrowthPercentage())
            );
        };
    }

    private String normalizePeriod(String period) {
        if (period == null || period.isBlank()) {
            return "today";
        }

        String normalized = period.trim().toLowerCase();
        return switch (normalized) {
            case "today", "hôm nay" -> "today";
            case "week", "this_week", "7 ngày qua", "tuần này" -> "week";
            case "month", "this_month", "tháng này" -> "month";
            default -> "today";
        };
    }

    private String toDashboardTimeRange(String period) {
        return switch (period) {
            case "week" -> "7 ngày qua";
            case "month" -> "Tháng này";
            default -> "Hôm nay";
        };
    }

    private String summarizeRevenueTrend(double growthPercentage) {
        if (growthPercentage > 10) {
            return "Doanh thu đang tăng tốt";
        }
        if (growthPercentage < 0) {
            return "Doanh thu đang giảm, cần theo dõi";
        }
        return "Doanh thu đang ổn định";
    }
}
