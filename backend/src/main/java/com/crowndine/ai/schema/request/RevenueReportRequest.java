package com.crowndine.ai.schema.request;

import org.springframework.ai.tool.annotation.ToolParam;

public record RevenueReportRequest(
        @ToolParam(description = "Khoảng thời gian báo cáo, ví dụ today, yesterday hoặc MM/yyyy") String period) {
}
