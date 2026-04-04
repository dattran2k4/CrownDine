package com.crowndine.service;

import com.crowndine.model.OrderDetail;
import com.crowndine.model.Order;
import com.crowndine.model.Voucher;

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
