package com.crowndine.ai.schema.request;

import org.springframework.ai.tool.annotation.ToolParam;

public record RevenueReportRequest(
        @ToolParam(description = "Khoảng thời gian báo cáo. Hỗ trợ today, week hoặc month", required = false) String period) {
}
