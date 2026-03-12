package com.crowndine.service.payment;

import com.crowndine.dto.request.PaymentRequest;

import java.util.Map;

public interface PaymentStrategy<T> {
    String createPaymentLink(PaymentRequest request, String username);

    void handleWebHook(Map<String, Object> webhookBody);
}
