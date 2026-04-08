package com.crowndine.core.service.payment;

import com.crowndine.presentation.dto.request.PaymentRequest;

import java.util.Map;

public interface PaymentStrategy {
    String createPaymentLink(PaymentRequest request, String username);

    void handleWebHook(Map<String, Object> webhookBody);
}
