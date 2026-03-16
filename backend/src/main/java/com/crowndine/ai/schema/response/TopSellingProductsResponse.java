package com.crowndine.ai.schema.response;

import java.math.BigDecimal;
import java.util.List;

public record TopSellingProductsResponse(
        String productType,
        List<TopSellingProduct> products
) {
    public record TopSellingProduct(
            Long id,
            String name,
            Long soldCount,
            BigDecimal sellingPrice
    ) {
    }
}
