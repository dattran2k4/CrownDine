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

import com.crowndine.dto.response.ChartDataResponse;
import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class DashboardServiceImpl implements DashboardService {

        private final OrderRepository orderRepository;

        @Override
        public DashboardSalesResponse getTodaySalesResults(String viewMode, String timeRange) {
                LocalDate today = LocalDate.now();
                LocalDateTime startToday = today.atStartOfDay();
                LocalDateTime endToday = today.atTime(LocalTime.MAX);

                LocalDate yesterday = today.minusDays(1);
                LocalDateTime startYesterday = yesterday.atStartOfDay();
                LocalDateTime endYesterday = yesterday.atTime(LocalTime.MAX);

                // Calculate time range for filtered widgets
                LocalDateTime rangeStart = calculateRangeStart(today, timeRange);
                LocalDateTime rangeEnd = timeRange.equals("Tháng trước") ? calculateRangeEnd(today, timeRange)
                                : endToday;

                DashboardSalesResponse response = calculateSalesSummary(startToday, endToday, startYesterday,
                                endYesterday);

                // Add widget specific data
                addRevenueWidgetData(response, viewMode, rangeStart, rangeEnd);
                addCustomerWidgetData(response, viewMode, rangeStart, rangeEnd, response.getTotalCustomersToday());
                addTopProductsWidgetData(response, rangeStart, rangeEnd);

                return response;
        }

        private LocalDateTime calculateRangeStart(LocalDate today, String timeRange) {
                if ("Hôm qua".equals(timeRange))
                        return today.minusDays(1).atStartOfDay();
                if ("7 ngày qua".equals(timeRange))
                        return today.minusDays(6).atStartOfDay();
                if ("Tháng này".equals(timeRange))
                        return today.withDayOfMonth(1).atStartOfDay();
                if ("Tháng trước".equals(timeRange))
                        return today.minusMonths(1).withDayOfMonth(1).atStartOfDay();
                return today.atStartOfDay(); // Hôm nay
        }

        private LocalDateTime calculateRangeEnd(LocalDate today, String timeRange) {
                if ("Tháng trước".equals(timeRange)) {
                        LocalDate firstDayLastMonth = today.minusMonths(1).withDayOfMonth(1);
                        return firstDayLastMonth.withDayOfMonth(firstDayLastMonth.lengthOfMonth())
                                        .atTime(LocalTime.MAX);
                }
                if ("Hôm qua".equals(timeRange))
                        return today.minusDays(1).atTime(LocalTime.MAX);
                return today.atTime(LocalTime.MAX);
        }

        private DashboardSalesResponse calculateSalesSummary(LocalDateTime startT, LocalDateTime endT,
                        LocalDateTime startY, LocalDateTime endY) {
                long completedToday = orderRepository.countByStatusAndCreatedAtBetween(EOrderStatus.COMPLETED, startT,
                                endT);
                long completedYesterday = orderRepository.countByStatusAndCreatedAtBetween(EOrderStatus.COMPLETED,
                                startY, endY);
                long servingToday = orderRepository.countByStatusAndCreatedAtBetween(EOrderStatus.SERVED, startT, endT);

                java.math.BigDecimal todayRevenue = orderRepository
                                .sumTotalAmountByStatusAndCreatedAtBetween(EOrderStatus.COMPLETED, startT, endT);
                java.math.BigDecimal servingRevenue = orderRepository
                                .sumTotalAmountByStatusAndCreatedAtBetween(EOrderStatus.SERVED, startT, endT);

                long customersToday = completedToday + servingToday;
                long customersYesterday = completedYesterday
                                + orderRepository.countByStatusAndCreatedAtBetween(EOrderStatus.SERVED, startY, endY);

                return DashboardSalesResponse.builder()
                                .completedOrdersToday(completedToday)
                                .completedGrowthPercentage(calculateGrowth(completedToday, completedYesterday))
                                .completedTotalAmount(todayRevenue != null ? todayRevenue.doubleValue() : 0)
                                .completedOrdersYesterday(completedYesterday)
                                .servingOrdersToday(servingToday)
                                .servingTotalAmount(servingRevenue != null ? servingRevenue.doubleValue() : 0)
                                .totalCustomersToday(customersToday)
                                .totalCustomersYesterday(customersYesterday)
                                .customersGrowthPercentage(calculateGrowth(customersToday, customersYesterday))
                                .build();
        }

        private void addRevenueWidgetData(DashboardSalesResponse response, String viewMode, LocalDateTime start,
                        LocalDateTime end) {
                java.math.BigDecimal rangeTotal = orderRepository
                                .sumTotalAmountByStatusAndCreatedAtBetween(EOrderStatus.COMPLETED, start, end);
                response.setRangeTotalAmount(rangeTotal != null ? rangeTotal.doubleValue() : 0);

                List<ChartDataResponse> revenueChart = new ArrayList<>();
                // TODO: Replace with real aggregation logic
                if ("Theo giờ".equals(viewMode)) {
                        revenueChart.add(new ChartDataResponse("08:00", 1.2));
                        revenueChart.add(new ChartDataResponse("19:00", response.getRangeTotalAmount() / 1000000));
                } else {
                        revenueChart.add(new ChartDataResponse("Thứ 7", response.getRangeTotalAmount() / 1000000));
                }
                response.setRevenueChart(revenueChart);
        }

        private void addCustomerWidgetData(DashboardSalesResponse response, String viewMode, LocalDateTime start,
                        LocalDateTime end, long currentTotal) {
                List<ChartDataResponse> customerChart = new ArrayList<>();
                // TODO: Replace with real aggregation logic
                if ("Theo giờ".equals(viewMode)) {
                        customerChart.add(new ChartDataResponse("19:00", (double) currentTotal));
                } else {
                        customerChart.add(new ChartDataResponse("Thứ 7", 45.0));
                }
                response.setCustomerChart(customerChart);
        }

        private void addTopProductsWidgetData(DashboardSalesResponse response, LocalDateTime start, LocalDateTime end) {
                List<ChartDataResponse> topProducts = new ArrayList<>();
                // TODO: Replace with real aggregation logic
                topProducts.add(new ChartDataResponse("Súp kem gà nữ hoàng", 4.4));
                topProducts.add(new ChartDataResponse("Xúc xích Đức nướng", 2.8));
                response.setTopProducts(topProducts);
        }

        private double calculateGrowth(long current, long previous) {
                if (previous == 0)
                        return current > 0 ? 100 : 0;
                return ((double) (current - previous) / previous) * 100;
        }
}
