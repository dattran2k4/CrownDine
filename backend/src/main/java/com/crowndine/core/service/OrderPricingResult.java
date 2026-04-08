package com.crowndine.core.service;

import java.math.BigDecimal;

public record OrderPricingResult(
        BigDecimal totalPrice,
        BigDecimal discountPrice,
        BigDecimal finalPrice
) {
}
