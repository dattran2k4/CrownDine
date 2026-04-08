package com.crowndine.core.service;

import com.crowndine.core.entity.OrderDetail;
import com.crowndine.core.entity.Order;
import com.crowndine.core.entity.Voucher;

import java.math.BigDecimal;
import java.util.List;

public interface CalculationService {

    BigDecimal calculateTotalOrder(List<OrderDetail> details);

    BigDecimal calculateTableDeposit(BigDecimal baseDeposit);

    BigDecimal calculateDepositPayment(BigDecimal itemsTotal, BigDecimal tableDeposit);

    BigDecimal calculateVoucherDiscount(BigDecimal orderAmount, Voucher voucher);

    BigDecimal calculateFinalTotalPrice(BigDecimal totalPrice, BigDecimal discountPrice);

    OrderPricingResult calculateOrderPricing(Order order);
}
