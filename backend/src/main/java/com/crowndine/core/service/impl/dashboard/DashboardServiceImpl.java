package com.crowndine.core.service.impl.dashboard;

import com.crowndine.common.enums.EOrderStatus;
import com.crowndine.presentation.dto.response.DashboardSalesResponse;
import com.crowndine.core.repository.OrderRepository;
import com.crowndine.core.service.dashboard.DashboardService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;

import com.crowndine.presentation.dto.response.ChartDataResponse;
import com.crowndine.presentation.dto.response.RecentActivityResponse;
import com.crowndine.core.entity.Order;
import com.crowndine.core.entity.OrderDetail;
import java.util.ArrayList;
import java.util.List;
import java.util.HashMap;
import java.util.Map;
import java.util.stream.Collectors;
import java.math.BigDecimal;
import org.apache.poi.ss.usermodel.*;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import java.io.ByteArrayOutputStream;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
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
                addRevenueWidgetData(response, viewMode, timeRange, rangeStart, rangeEnd);
                addCustomerWidgetData(response, viewMode, timeRange, rangeStart, rangeEnd,
                                response.getTotalCustomersToday());
                addTopProductsWidgetData(response, rangeStart, rangeEnd);
                addRecentActivitiesWidgetData(response);

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

        private void addRevenueWidgetData(DashboardSalesResponse response, String viewMode, String timeRange,
                        LocalDateTime start,
                        LocalDateTime end) {
                java.math.BigDecimal rangeTotal = orderRepository
                                .sumTotalAmountByStatusAndCreatedAtBetween(EOrderStatus.COMPLETED, start, end);
                response.setRangeTotalAmount(rangeTotal != null ? rangeTotal.doubleValue() : 0);

                List<Order> orders = orderRepository.findAllByStatusAndCreatedAtBetween(EOrderStatus.COMPLETED, start,
                                end);
                List<ChartDataResponse> revenueChart = new ArrayList<>();

                if ("Theo giờ".equals(viewMode)) {
                        for (int h = 7; h <= 22; h++) {
                                String label = String.format("%02dg", h);
                                final int hour = h;
                                double sum = orders.stream()
                                                .filter(o -> o.getCreatedAt().getHour() == hour)
                                                .mapToDouble(o -> o.getFinalPrice().doubleValue())
                                                .sum();
                                revenueChart.add(new ChartDataResponse(label, sum / 1000000.0));
                        }
                } else {
                        LocalDate sDate = start.toLocalDate();
                        LocalDate eDate = end.toLocalDate();
                        for (LocalDate date = sDate; !date.isAfter(eDate); date = date.plusDays(1)) {
                                String label = timeRange.startsWith("Tháng")
                                                ? String.valueOf(date.getDayOfMonth())
                                                : String.format("%s, %02d/%02d", getDayOfWeekVietnamese(date),
                                                                date.getDayOfMonth(), date.getMonthValue());
                                final LocalDate targetDate = date;
                                double sum = orders.stream()
                                                .filter(o -> o.getCreatedAt().toLocalDate().isEqual(targetDate))
                                                .mapToDouble(o -> o.getFinalPrice().doubleValue())
                                                .sum();
                                revenueChart.add(new ChartDataResponse(label, sum / 1000000.0));
                        }
                }
                response.setRevenueChart(revenueChart);
        }

        private String getDayOfWeekVietnamese(LocalDate date) {
                switch (date.getDayOfWeek()) {
                        case MONDAY:
                                return "Thứ 2";
                        case TUESDAY:
                                return "Thứ 3";
                        case WEDNESDAY:
                                return "Thứ 4";
                        case THURSDAY:
                                return "Thứ 5";
                        case FRIDAY:
                                return "Thứ 6";
                        case SATURDAY:
                                return "Thứ 7";
                        case SUNDAY:
                                return "CN";
                        default:
                                return "";
                }
        }

        private void addCustomerWidgetData(DashboardSalesResponse response, String viewMode, String timeRange,
                        LocalDateTime start,
                        LocalDateTime end, long currentTotal) {
                List<Order> orders = orderRepository.findAllByCreatedAtBetween(start, end);
                response.setRangeTotalCustomers(orders.size());
                List<ChartDataResponse> customerChart = new ArrayList<>();

                if ("Theo giờ".equals(viewMode)) {
                        for (int h = 7; h <= 22; h++) {
                                String label = String.format("%02dg", h);
                                final int hour = h;
                                long count = orders.stream()
                                                .filter(o -> o.getCreatedAt().getHour() == hour)
                                                .count();
                                customerChart.add(new ChartDataResponse(label, (double) count));
                        }
                } else {
                        LocalDate sDate = start.toLocalDate();
                        LocalDate eDate = end.toLocalDate();
                        for (LocalDate date = sDate; !date.isAfter(eDate); date = date.plusDays(1)) {
                                String label = timeRange.startsWith("Tháng")
                                                ? String.valueOf(date.getDayOfMonth())
                                                : String.format("%s, %02d/%02d", getDayOfWeekVietnamese(date),
                                                                date.getDayOfMonth(), date.getMonthValue());
                                final LocalDate targetDate = date;
                                long count = orders.stream()
                                                .filter(o -> o.getCreatedAt().toLocalDate().isEqual(targetDate))
                                                .count();
                                customerChart.add(new ChartDataResponse(label, (double) count));
                        }
                }
                response.setCustomerChart(customerChart);
        }

        private void addTopProductsWidgetData(DashboardSalesResponse response, LocalDateTime start, LocalDateTime end) {
                List<Order> completedOrders = orderRepository.findAllByStatusAndCreatedAtBetween(EOrderStatus.COMPLETED,
                                start,
                                end);
                Map<String, BigDecimal> productRevenue = new HashMap<>();
                Map<String, Long> productQuantity = new HashMap<>();

                for (Order order : completedOrders) {
                        for (OrderDetail detail : order.getOrderDetails()) {
                                String name = detail.getProductName();
                                BigDecimal revenue = detail.getTotalPrice();
                                Integer quantity = detail.getQuantity();

                                if (revenue != null) {
                                        productRevenue.put(name, productRevenue.getOrDefault(name, BigDecimal.ZERO)
                                                        .add(revenue));
                                }
                                if (quantity != null) {
                                        productQuantity.put(name, productQuantity.getOrDefault(name, 0L) + quantity);
                                }
                        }
                }

                List<ChartDataResponse> topProductsRevenue = productRevenue.entrySet().stream()
                                .sorted(Map.Entry.<String, BigDecimal>comparingByValue().reversed())
                                .limit(10)
                                .map(entry -> new ChartDataResponse(entry.getKey(),
                                                entry.getValue().doubleValue() / 1000000.0))
                                .collect(Collectors.toList());

                List<ChartDataResponse> topProductsQuantity = productQuantity.entrySet().stream()
                                .sorted(Map.Entry.<String, Long>comparingByValue().reversed())
                                .limit(10)
                                .map(entry -> new ChartDataResponse(entry.getKey(),
                                                entry.getValue().doubleValue()))
                                .collect(Collectors.toList());

                response.setTopProducts(topProductsRevenue);
                response.setTopProductsQuantity(topProductsQuantity);
        }

        private double calculateGrowth(long current, long previous) {
                if (previous == 0)
                        return current > 0 ? 100 : 0;
                return ((double) (current - previous) / previous) * 100;
        }

        private void addRecentActivitiesWidgetData(DashboardSalesResponse response) {
                List<Order> recentOrders = orderRepository.findTop50ByUpdatedByIsNotNullOrderByUpdatedAtDesc();
                List<RecentActivityResponse> activities = new ArrayList<>();
                java.time.format.DateTimeFormatter formatter = java.time.format.DateTimeFormatter.ofPattern("HH:mm - dd/MM/yyyy");

                for (Order o : recentOrders) {
                        String orderCode = o.getCode() != null ? " #" + o.getCode() : "";
                        String action = "cập nhật đơn hàng" + orderCode;
                        String type = "sale";

                        switch (o.getStatus()) {
                                case COMPLETED:
                                        action = "hoàn tất hóa đơn" + orderCode;
                                        break;
                                case CANCELLED:
                                        action = "đã hủy đơn hàng" + orderCode;
                                        type = "delete";
                                        break;
                                case SERVED:
                                        action = "phục vụ món mới cho đơn" + orderCode;
                                        break;
                                default:
                                        action = "chỉnh sửa đơn hàng" + orderCode;
                                        break;
                        }

                        activities.add(RecentActivityResponse.builder()
                                        .id(o.getId() + "_" + o.getUpdatedAt().toString())
                                        .user(o.getUpdatedBy())
                                        .action(action)
                                        .value(o.getFinalPrice() != null ? o.getFinalPrice().doubleValue() + "" : "0")
                                        .time(o.getUpdatedAt().format(formatter))
                                        .type(type)
                                        .reason(o.getCancelReason())
                                        .build());
                }
                response.setRecentActivities(activities);
        }

        @Override
        public byte[] exportSalesReport(String timeRange) throws java.io.IOException {
                LocalDate today = LocalDate.now();
                LocalDateTime start = calculateRangeStart(today, timeRange);
                LocalDateTime end = calculateRangeEnd(today, timeRange);

                List<Order> orders = orderRepository.findAllByStatusAndCreatedAtBetween(EOrderStatus.COMPLETED, start,
                                end);

                // Group top products
                Map<String, Long> productQuantity = new HashMap<>();
                Map<String, BigDecimal> productRevenue = new HashMap<>();
                for (Order order : orders) {
                        for (OrderDetail detail : order.getOrderDetails()) {
                                String name = detail.getProductName();
                                productQuantity.put(name,
                                                productQuantity.getOrDefault(name, 0L) + detail.getQuantity());
                                productRevenue.put(name, productRevenue.getOrDefault(name, BigDecimal.ZERO)
                                                .add(detail.getTotalPrice()));
                        }
                }

                try (Workbook workbook = new XSSFWorkbook(); ByteArrayOutputStream out = new ByteArrayOutputStream()) {
                        // 1. Sheet Summary
                        Sheet summarySheet = workbook.createSheet("Báo cáo chung");
                        createSummarySheet(summarySheet, workbook, timeRange, orders, start, end);

                        // 2. Sheet Orders
                        Sheet orderSheet = workbook.createSheet("Danh sách đơn hàng");
                        createOrderSheet(orderSheet, workbook, orders);

                        // 3. Sheet Products
                        Sheet productSheet = workbook.createSheet("Top sản phẩm");
                        createProductSheet(productSheet, workbook, productRevenue, productQuantity);

                        workbook.write(out);
                        return out.toByteArray();
                }
        }

        private void createSummarySheet(Sheet sheet, Workbook workbook, String timeRange, List<Order> orders,
                        LocalDateTime start, LocalDateTime end) {
                // Header style
                CellStyle headerStyle = workbook.createCellStyle();
                Font headerFont = workbook.createFont();
                headerFont.setBold(true);
                headerFont.setFontHeightInPoints((short) 14);
                headerStyle.setFont(headerFont);
                headerStyle.setAlignment(HorizontalAlignment.CENTER);

                // Normal bold style
                CellStyle boldStyle = workbook.createCellStyle();
                Font boldFont = workbook.createFont();
                boldFont.setBold(true);
                boldStyle.setFont(boldFont);

                Row titleRow = sheet.createRow(0);
                Cell titleCell = titleRow.createCell(0);
                titleCell.setCellValue("BÁO CÁO DOANH THU - " + timeRange.toUpperCase());
                titleCell.setCellStyle(headerStyle);
                sheet.addMergedRegion(new org.apache.poi.ss.util.CellRangeAddress(0, 0, 0, 3));

                Row rangeRow = sheet.createRow(1);
                rangeRow.createCell(0).setCellValue("Thời gian:");
                rangeRow.createCell(1).setCellValue(start.toLocalDate() + " đến " + end.toLocalDate());

                double totalRevenue = orders.stream().mapToDouble(o -> o.getFinalPrice().doubleValue()).sum();

                Row revRow = sheet.createRow(3);
                revRow.createCell(0).setCellValue("Tổng doanh thu:");
                Cell revVal = revRow.createCell(1);
                revVal.setCellValue(totalRevenue);
                revVal.setCellStyle(boldStyle);

                Row orderCountRow = sheet.createRow(4);
                orderCountRow.createCell(0).setCellValue("Tổng số đơn hàng:");
                orderCountRow.createCell(1).setCellValue(orders.size());

                long totalCustomers = orders.size(); // Simplified
                Row customerRow = sheet.createRow(5);
                customerRow.createCell(0).setCellValue("Tổng số khách hàng:");
                customerRow.createCell(1).setCellValue(totalCustomers);

                sheet.autoSizeColumn(0);
                sheet.autoSizeColumn(1);
        }

        private void createOrderSheet(Sheet sheet, Workbook workbook, List<Order> orders) {
                String[] headers = { "Mã đơn", "Ngày tạo", "Bàn/Phòng", "Khách hàng", "Tổng tiền", "Trạng thái" };
                Row headerRow = sheet.createRow(0);
                CellStyle headerStyle = workbook.createCellStyle();
                Font font = workbook.createFont();
                font.setBold(true);
                headerStyle.setFont(font);
                headerStyle.setFillForegroundColor(IndexedColors.GREY_25_PERCENT.getIndex());
                headerStyle.setFillPattern(FillPatternType.SOLID_FOREGROUND);

                for (int i = 0; i < headers.length; i++) {
                        Cell cell = headerRow.createCell(i);
                        cell.setCellValue(headers[i]);
                        cell.setCellStyle(headerStyle);
                }

                int rowIdx = 1;
                for (Order order : orders) {
                        Row row = sheet.createRow(rowIdx++);
                        row.createCell(0).setCellValue(order.getCode());
                        row.createCell(1).setCellValue(order.getCreatedAt().toString());
                        row.createCell(2).setCellValue(
                                        order.getRestaurantTable() != null ? order.getRestaurantTable().getName()
                                                        : "Mang về");
                        row.createCell(3).setCellValue(
                                        order.getUser() != null ? order.getUser().getFullName() : "Khách lẻ");
                        row.createCell(4).setCellValue(order.getFinalPrice().doubleValue());
                        row.createCell(5).setCellValue("Hoàn thành");
                }

                for (int i = 0; i < headers.length; i++) {
                        sheet.autoSizeColumn(i);
                }
        }

        private void createProductSheet(Sheet sheet, Workbook workbook, Map<String, BigDecimal> revenue,
                        Map<String, Long> quantity) {
                String[] headers = { "Tên sản phẩm", "Số lượng bán", "Doanh thu (VNĐ)" };
                Row headerRow = sheet.createRow(0);
                CellStyle headerStyle = workbook.createCellStyle();
                Font font = workbook.createFont();
                font.setBold(true);
                headerStyle.setFont(font);

                for (int i = 0; i < headers.length; i++) {
                        Cell cell = headerRow.createCell(i);
                        cell.setCellValue(headers[i]);
                        cell.setCellStyle(headerStyle);
                }

                List<Map.Entry<String, BigDecimal>> sorted = revenue.entrySet().stream()
                                .sorted(Map.Entry.<String, BigDecimal>comparingByValue().reversed())
                                .limit(50)
                                .collect(Collectors.toList());

                int rowIdx = 1;
                for (Map.Entry<String, BigDecimal> entry : sorted) {
                        Row row = sheet.createRow(rowIdx++);
                        row.createCell(0).setCellValue(entry.getKey());
                        row.createCell(1).setCellValue(quantity.get(entry.getKey()));
                        row.createCell(2).setCellValue(entry.getValue().doubleValue());
                }

                sheet.autoSizeColumn(0);
                sheet.autoSizeColumn(1);
                sheet.autoSizeColumn(2);
        }
}
