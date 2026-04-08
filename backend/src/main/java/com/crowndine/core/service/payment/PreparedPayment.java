package com.crowndine.core.service.payment;

import com.crowndine.core.entity.Payment;

import java.math.BigDecimal;

public record PreparedPayment(Payment payment, BigDecimal amount, String description) {
}
