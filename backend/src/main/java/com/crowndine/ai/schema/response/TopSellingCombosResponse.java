package com.crowndine.ai.schema.response;

import java.math.BigDecimal;
import java.util.List;

public record TopSellingCombosResponse(
        List<TopSellingCombo> combos
) {
    public record TopSellingCombo(
            Long id,
            String name,
            Long soldCount,
            BigDecimal sellingPrice
    ) {
    }
}
