package com.crowndine.service;

import com.crowndine.model.OrderDetail;

import java.math.BigDecimal;
import java.util.List;

public interface CalculationService {

    BigDecimal calculateTotalOrder(List<OrderDetail> details);

    BigDecimal calculateDepositPayment(BigDecimal itemsTotal, BigDecimal tableDeposit);
}
