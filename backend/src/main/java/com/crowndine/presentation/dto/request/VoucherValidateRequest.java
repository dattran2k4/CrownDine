package com.crowndine.presentation.dto.request;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;

@Getter
public class VoucherValidateRequest {

    @NotBlank(message = "{validation.voucher.code.not_blank}")
    private String code;

    @NotNull(message = "{validation.voucher.order_id.not_null}")
    @Min(value = 1, message = "{validation.voucher.order_id.min}")
    private Long orderId;
}
