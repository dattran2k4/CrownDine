package com.crowndine.dto.response;

import com.crowndine.common.enums.EOrderStatus;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Getter
@Setter
public class OrderDetailHistoryResponse {
    private Long orderId;
    private String tableName;
    private EOrderStatus status;
    private BigDecimal totalPrice;
    private BigDecimal discountPrice;
    private BigDecimal finalPrice;
    private BigDecimal itemsTotal;
    private BigDecimal tableDeposit;
    private BigDecimal depositAmount;
    private BigDecimal remainingAmount;
    private LocalDateTime createdAt;

    private List<OrderLineResponse> items;
}