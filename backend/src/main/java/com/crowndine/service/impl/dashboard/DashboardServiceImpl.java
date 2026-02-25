package com.crowndine.service.impl.dashboard;

import com.crowndine.common.enums.EOrderStatus;
import com.crowndine.dto.response.DashboardSalesResponse;
import com.crowndine.repository.OrderRepository;
import com.crowndine.service.dashboard.DashboardService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;

@Service
@RequiredArgsConstructor
public class DashboardServiceImpl implements DashboardService {

    private final OrderRepository orderRepository;

    @Override
    public DashboardSalesResponse getTodaySalesResults() {
        LocalDate today = LocalDate.now();
        LocalDateTime startToday = today.atStartOfDay();
        LocalDateTime endToday = today.atTime(LocalTime.MAX);

        LocalDate yesterday = today.minusDays(1);
        LocalDateTime startYesterday = yesterday.atStartOfDay();
        LocalDateTime endYesterday = yesterday.atTime(LocalTime.MAX);

        long completedToday = orderRepository.countByStatusAndCreatedAtBetween(
                EOrderStatus.COMPLETED, startToday, endToday);

        long completedYesterday = orderRepository.countByStatusAndCreatedAtBetween(
                EOrderStatus.COMPLETED, startYesterday, endYesterday);

        double completedGrowth = 0;
        if (completedYesterday > 0) {
            completedGrowth = ((double) (completedToday - completedYesterday) / completedYesterday) * 100;
        } else if (completedToday > 0) {
            completedGrowth = 100;
        }

        long servingToday = orderRepository.countByStatusAndCreatedAtBetween(
                EOrderStatus.SERVED, startToday, endToday);

        java.math.BigDecimal completedRevenue = orderRepository.sumTotalAmountByStatusAndCreatedAtBetween(
                EOrderStatus.COMPLETED, startToday, endToday);
        java.math.BigDecimal servingRevenue = orderRepository.sumTotalAmountByStatusAndCreatedAtBetween(
                EOrderStatus.SERVED, startToday, endToday);

        long customersToday = completedToday + servingToday;
        long customersYesterday = completedYesterday + orderRepository.countByStatusAndCreatedAtBetween(
                EOrderStatus.SERVED, startYesterday, endYesterday);

        double customersGrowth = 0;
        if (customersYesterday > 0) {
            customersGrowth = ((double) (customersToday - customersYesterday) / customersYesterday) * 100;
        } else if (customersToday > 0) {
            customersGrowth = 100;
        }

        return DashboardSalesResponse.builder()
                .completedOrdersToday(completedToday)
                .completedGrowthPercentage(completedGrowth)
                .completedTotalAmount(completedRevenue != null ? completedRevenue.doubleValue() : 0)
                .completedOrdersYesterday(completedYesterday)
                .servingOrdersToday(servingToday)
                .servingTotalAmount(servingRevenue != null ? servingRevenue.doubleValue() : 0)
                .totalCustomersToday(customersToday)
                .totalCustomersYesterday(customersYesterday)
                .customersGrowthPercentage(customersGrowth)
                .build();
    }
}
