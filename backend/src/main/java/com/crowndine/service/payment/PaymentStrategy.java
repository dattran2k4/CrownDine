package com.crowndine.service.payment;

import com.crowndine.dto.request.PaymentRequest;

public interface PaymentStrategy<T> {
    String createPaymentLink(PaymentRequest request, String username);

    void handleWebHook(T data);
}
