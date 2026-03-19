package com.crowndine.dto.response;

import lombok.Builder;
import lombok.Getter;

import java.math.BigDecimal;

@Getter
@Builder
public class TopSellingComboResponse {
    private Long id;
    private String name;
    private Long soldCount;
    private BigDecimal sellingPrice;
}
