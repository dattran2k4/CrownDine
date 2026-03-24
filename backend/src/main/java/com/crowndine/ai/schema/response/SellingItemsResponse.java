package com.crowndine.ai.schema.response;

import java.math.BigDecimal;
import java.util.List;

public record SellingItemsResponse(List<SellingItem> items) {
    public record SellingItem(Long id, String name, Long soldCount, BigDecimal price, String status) {
    }
}
