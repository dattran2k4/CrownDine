package com.crowndine.ai.tool.function;

import com.crowndine.ai.schema.request.RevenueReportRequest;
import com.crowndine.ai.schema.response.RevenueReportResponse;
import com.crowndine.ai.tool.AIToolNames;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Description;

import java.util.function.Function;

@Configuration
public class AdminFunctionToolsConfig {

    @Bean(AIToolNames.REVENUE_REPORT_TOOL)
    @Description("Lấy báo cáo doanh thu của nhà hàng. Tham số period có thể là today, yesterday hoặc tháng MM/yyyy")
    public Function<RevenueReportRequest, RevenueReportResponse> getRevenueReport() {
        return request -> {
            System.out.println("== AI đang gọi hàm lấy doanh thu cho: " + request.period());
            if (request.period().contains("today")) {
                return new RevenueReportResponse(5000000.0, "VND", "Ổn định");
            }
            return new RevenueReportResponse(150000000.0, "VND", "Tăng trưởng tốt");
        };
    }
}
