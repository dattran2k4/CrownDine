package com.crowndine.ai.schema.response;

public record RevenueReportResponse(
        String period,
        double totalRevenue,
        String currency,
        long completedOrders,
        long totalCustomers,
        String summary) {
}
