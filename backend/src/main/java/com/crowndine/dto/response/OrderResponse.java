package com.crowndine.dto.response;

import com.crowndine.common.enums.EOrderStatus;
import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;

@Builder
@Getter
@Setter
public class OrderResponse {
    private Long id;
    private String code;
    private BigDecimal totalPrice;
    private BigDecimal discountPrice;
    private BigDecimal finalPrice;
    private EOrderStatus status;
    private String tableName;
}
