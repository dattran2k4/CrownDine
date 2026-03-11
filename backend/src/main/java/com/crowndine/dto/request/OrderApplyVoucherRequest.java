package com.crowndine.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.Getter;

@Getter
public class OrderApplyVoucherRequest {

    @NotBlank(message = "Mã voucher không được để trống")
    private String code;
}
