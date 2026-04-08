package com.crowndine.presentation.dto.request;

import com.crowndine.common.enums.EPaymentMethod;
import com.crowndine.presentation.dto.validator.EnumValue;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;

@Getter
public class PaymentRequest {

    private String reservationCode;

    private String orderCode;

    @NotNull(message = "Chưa có phương thức giao dịch")
    @EnumValue(name = "gender", enumClass = EPaymentMethod.class)
    private EPaymentMethod method;
}
