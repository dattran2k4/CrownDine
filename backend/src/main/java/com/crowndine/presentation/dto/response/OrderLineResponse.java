package com.crowndine.presentation.dto.response;

import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;

@Getter
@Setter
public class OrderLineResponse {
    private Long orderDetailId;
    private Long productId;
    private String name;
    private String type; // "ITEM" hoặc "COMBO"
    private Integer quantity;
    private BigDecimal unitPrice;
    private BigDecimal totalPrice;
    private boolean hasFeedback;
}