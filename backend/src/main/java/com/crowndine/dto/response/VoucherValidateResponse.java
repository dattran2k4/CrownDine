package com.crowndine.dto.response;

import com.crowndine.common.enums.EVoucherType;
import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;

@Getter
@Setter
@Builder
public class VoucherValidateResponse {
    private Long voucherId;
    private String code;
    private String name;
    private EVoucherType type;
    private BigDecimal orderAmount;
    private BigDecimal discountAmount;
    private BigDecimal finalAmount;
    private Integer usageCount;
    private Integer usageLimit;
}
