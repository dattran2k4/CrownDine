package com.crowndine.ai.schema.request;

import org.springframework.ai.tool.annotation.ToolParam;

public record TopSellingProductsRequest(
        @ToolParam(description = "Số lượng sản phẩm muốn lấy, tối đa 10", required = false)
        Integer limit
) {
}
