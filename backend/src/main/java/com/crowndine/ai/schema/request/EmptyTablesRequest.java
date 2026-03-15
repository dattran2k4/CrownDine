package com.crowndine.ai.schema.request;

import org.springframework.ai.tool.annotation.ToolParam;

public record EmptyTablesRequest(
        @ToolParam(description = "Khu vực hoặc tầng cần kiểm tra, có thể bỏ trống", required = false) String area) {
}
