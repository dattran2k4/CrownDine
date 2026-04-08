package com.crowndine.presentation.dto.response;

import com.crowndine.common.enums.*;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Getter
@Setter
public class PaymentSummaryResponse {
    private Long id;

    private Long code;

    private String username;

    private String orderCode;

    private String reservationCode;

    private BigDecimal amount;

    private String transactionCode;

    private EPaymentMethod method;

    private EPaymentStatus status;

    private EPaymentType type;

    private EPaymentTarget target;

    private EPaymentSource source;

    private LocalDateTime createdAt;
}
