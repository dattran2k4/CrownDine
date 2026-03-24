package com.crowndine.ai.tool.method;

import com.crowndine.ai.schema.request.RevenueSummaryRequest;
import com.crowndine.ai.schema.request.SellingItemsRequest;
import com.crowndine.ai.schema.response.RevenueSummaryResponse;
import com.crowndine.ai.schema.response.SellingItemsResponse;
import com.crowndine.ai.tool.AIToolNames;
import com.crowndine.common.enums.EItemStatus;
import com.crowndine.dto.response.DashboardSalesResponse;
import com.crowndine.model.Item;
import com.crowndine.repository.ItemRepository;
import com.crowndine.service.dashboard.DashboardService;
import org.springframework.ai.tool.annotation.Tool;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
public class AnalyticsMethodTools {

    private final DashboardService dashboardService;
    private final ItemRepository itemRepository;

    public AnalyticsMethodTools(DashboardService dashboardService, ItemRepository itemRepository) {
        this.dashboardService = dashboardService;
        this.itemRepository = itemRepository;
    }

    @Tool(name = AIToolNames.REVENUE_SUMMARY_TOOL,
            description = "Tong hop doanh thu nha hang theo thoi gian. Ho tro today, week, month. Dung tool nay khi Admin hoi tong doanh thu, tong khach, tong don hoan thanh theo giai doan.")
    public RevenueSummaryResponse getRevenueSummary(RevenueSummaryRequest request) {
        String normalizedPeriod = normalizePeriod(request.period());
        String timeRange = toDashboardTimeRange(normalizedPeriod);
        DashboardSalesResponse sales = dashboardService.getTodaySalesResults("Theo ngày", timeRange);

        return new RevenueSummaryResponse(
                normalizedPeriod,
                sales.getRangeTotalAmount(),
                "VND",
                sales.getCompletedOrdersToday(),
                sales.getRangeTotalCustomers(),
                summarizeRevenueTrend(sales.getCompletedGrowthPercentage())
        );
    }

    @Tool(name = AIToolNames.BEST_SELLING_ITEMS_TOOL,
            description = "Lay danh sach item ban chay nhat dua tren soldCount. Dung tool nay khi Admin hoi mon ban chay, item ban tot, item dang co hieu suat cao.")
    public SellingItemsResponse getBestSellingItems(SellingItemsRequest request) {
        return toSellingItemsResponse(itemRepository.findTop10ByStatusOrderBySoldCountDesc(EItemStatus.AVAILABLE), request.limit());
    }

    @Tool(name = AIToolNames.SLOW_SELLING_ITEMS_TOOL,
            description = "Lay danh sach item ban cham nhat dua tren soldCount. Dung tool nay khi Admin hoi mon ban cham, item can theo doi hoac can cai thien.")
    public SellingItemsResponse getSlowSellingItems(SellingItemsRequest request) {
        return toSellingItemsResponse(itemRepository.findTop10ByStatusOrderBySoldCountAsc(EItemStatus.AVAILABLE), request.limit());
    }

    private SellingItemsResponse toSellingItemsResponse(List<Item> items, Integer limit) {
        int normalizedLimit = limit == null || limit < 1 ? 5 : Math.min(limit, 10);
        List<SellingItemsResponse.SellingItem> summaries = items.stream()
                .limit(normalizedLimit)
                .map(item -> new SellingItemsResponse.SellingItem(
                        item.getId(),
                        item.getName(),
                        item.getSoldCount() != null ? item.getSoldCount() : 0L,
                        item.getPriceAfterDiscount() != null ? item.getPriceAfterDiscount() : item.getPrice(),
                        item.getStatus() != null ? item.getStatus().name() : null
                ))
                .toList();

        return new SellingItemsResponse(summaries);
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
