package com.crowndine.service;

import java.math.BigDecimal;

public record OrderPricingResult(
        BigDecimal totalPrice,
        BigDecimal discountPrice,
        BigDecimal finalPrice
) {
}
