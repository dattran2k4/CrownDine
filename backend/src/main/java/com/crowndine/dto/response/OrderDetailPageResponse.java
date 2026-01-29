package com.crowndine.dto.response;

import com.crowndine.common.enums.EOrderStatus;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Getter
@Setter
public class OrderDetailPageResponse {
    private Long orderId;
    private String tableName;
    private EOrderStatus status;
    private BigDecimal totalPrice;
    private BigDecimal discountPrice;
    private BigDecimal finalPrice;
    private LocalDateTime createdAt;

    private PageResponse<OrderLineResponse> items;
}