package com.crowndine.ai.schema.request;

import org.springframework.ai.tool.annotation.ToolParam;

public record TopSellingCombosRequest(
        @ToolParam(description = "So luong combo muon lay, toi da 10", required = false)
        Integer limit
) {
}
