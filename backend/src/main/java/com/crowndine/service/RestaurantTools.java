package com.crowndine.service;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Description;

import java.util.List;
import java.util.function.Function;

@Configuration
public class RestaurantTools {

    // Record định nghĩa dữ liệu đầu vào và đầu ra
    public record RevenueRequest(String period) {
    }

    public record RevenueResponse(double total, String currency, String status) {
    }

    public record TableResponse(int tableId, String zone, String status) {
    }

    @Bean
    @Description("Lấy báo cáo doanh thu của nhà hàng. Tham số 'period' có thể là 'today', 'yesterday' hoặc tháng 'MM/yyyy'")
    public Function<RevenueRequest, RevenueResponse> getRevenueReport() {
        return request -> {
            // Demo: Trong thực tế bạn sẽ gọi Repository tại đây
            System.out.println("== AI đang gọi hàm lấy doanh thu cho: " + request.period());
            if (request.period().contains("today")) {
                return new RevenueResponse(5000000.0, "VND", "Ổn định");
            }
            return new RevenueResponse(150000000.0, "VND", "Tăng trưởng tốt");
        };
    }

    @Bean
    @Description("Kiểm tra danh sách các bàn còn trống hiện tại")
    public Function<Void, List<TableResponse>> getEmptyTables() {
        return unused -> {
            System.out.println("== AI đang gọi hàm kiểm tra bàn trống");
            return List.of(
                    new TableResponse(101, "Khu vực A", "Trống"),
                    new TableResponse(205, "Tầng 2", "Trống")
            );
        };
    }
}
