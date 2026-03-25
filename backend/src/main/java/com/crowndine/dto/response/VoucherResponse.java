package com.crowndine.dto.response;

import com.crowndine.common.enums.EVoucherType;
import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Getter
@Setter
@Builder
public class VoucherResponse {
    private Long id;
    private String name;
    private String code;
    private EVoucherType type;
    private BigDecimal discountValue;
    private BigDecimal maxDiscountValue;
    private BigDecimal minValue;
    private String description;
    private Integer pointsRequired;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
