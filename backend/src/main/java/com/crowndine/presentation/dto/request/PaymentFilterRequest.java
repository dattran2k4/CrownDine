package com.crowndine.presentation.dto.request;

import com.crowndine.common.enums.EPaymentMethod;
import com.crowndine.common.enums.EPaymentSource;
import com.crowndine.common.enums.EPaymentStatus;
import com.crowndine.common.enums.EPaymentTarget;
import com.crowndine.common.enums.EPaymentType;
import lombok.Getter;
import lombok.Setter;
import org.springframework.format.annotation.DateTimeFormat;

import java.time.LocalDate;

@Getter
@Setter
public class PaymentFilterRequest {

    private EPaymentMethod method;

    private EPaymentStatus status;

    private EPaymentType type;

    private EPaymentTarget target;

    private EPaymentSource source;

    private String search;

    @DateTimeFormat(iso = DateTimeFormat.ISO.DATE)
    private LocalDate fromDate;

    @DateTimeFormat(iso = DateTimeFormat.ISO.DATE)
    private LocalDate toDate;
}
