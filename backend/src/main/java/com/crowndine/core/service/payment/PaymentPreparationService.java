package com.crowndine.core.service.payment;

import com.crowndine.common.enums.EPaymentMethod;
import com.crowndine.common.enums.EPaymentStatus;
import com.crowndine.presentation.dto.request.PaymentRequest;

public interface PaymentPreparationService {
    PreparedPayment prepare(PaymentRequest request, String username, EPaymentMethod method, EPaymentStatus initialStatus);
}
