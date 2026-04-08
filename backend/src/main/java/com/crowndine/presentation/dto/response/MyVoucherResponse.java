package com.crowndine.presentation.dto.response;

import com.crowndine.common.enums.EVoucherType;
import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Getter
@Setter
@Builder
public class MyVoucherResponse {
    private Long assignmentId;
    private Long voucherId;
    private String voucherCode;
    private String voucherName;
    private EVoucherType voucherType;
    private BigDecimal discountValue;
    private BigDecimal maxDiscountValue;
    private BigDecimal minValue;
    private String description;
    private Integer usageCount;
    private Integer usageLimit;
    private LocalDateTime assignedAt;
    private LocalDateTime expiredAt;
}
