package com.crowndine.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DashboardSalesResponse {
    private long completedOrdersToday;
    private double completedGrowthPercentage;
    private double completedTotalAmount;
    private long completedOrdersYesterday;

    private long servingOrdersToday;
    private double servingTotalAmount;

    private long totalCustomersToday;
    private long totalCustomersYesterday;
    private double customersGrowthPercentage;
}
