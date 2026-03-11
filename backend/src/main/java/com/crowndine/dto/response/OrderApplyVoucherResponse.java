package com.crowndine.dto.response;

import java.math.BigDecimal;

import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Builder
public class OrderApplyVoucherResponse {
    private Long orderId;
    private String orderCode;
    private Long voucherId;
    private String voucherCode;
    private BigDecimal totalPrice;
    private BigDecimal discountPrice;
    private BigDecimal finalPrice;
}
