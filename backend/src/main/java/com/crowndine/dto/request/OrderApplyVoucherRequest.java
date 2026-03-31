package com.crowndine.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.Getter;

@Getter
public class OrderApplyVoucherRequest {

    @NotBlank(message = "{validation.voucher.code.not_blank}")
    private String code;
}
