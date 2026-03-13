package com.crowndine.service.payment;

import com.crowndine.model.Payment;

import java.math.BigDecimal;

public record PreparedPayment(Payment payment, BigDecimal amount, String description) {
}
