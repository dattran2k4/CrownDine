package com.crowndine.ai.schema.response;

public record RevenueSummaryResponse(
        String period,
        double totalRevenue,
        String currency,
        long completedOrders,
        long totalCustomers,
        String revenueInsight
) {
}
