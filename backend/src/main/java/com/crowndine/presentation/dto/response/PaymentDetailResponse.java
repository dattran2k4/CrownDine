package com.crowndine.presentation.dto.response;

import com.crowndine.common.enums.*;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Getter
@Setter
public class PaymentDetailResponse {
    private Long id;

    private Long code;

    private BigDecimal amount;

    private String transactionCode;

    private String rawApiData;

    private EPaymentMethod method;

    private EPaymentStatus status;

    private EPaymentType type;

    private EPaymentTarget target;

    private EPaymentSource source;

    private String orderCode;

    private String reservationCode;

    private String username;

    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;
}
