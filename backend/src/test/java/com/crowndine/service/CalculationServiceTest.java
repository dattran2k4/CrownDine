package com.crowndine.core.service;

import com.crowndine.common.enums.EOrderDetailStatus;
import com.crowndine.common.enums.EVoucherType;
import com.crowndine.core.entity.Order;
import com.crowndine.core.entity.OrderDetail;
import com.crowndine.core.entity.Voucher;
import com.crowndine.core.service.impl.CalculationServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.math.BigDecimal;
import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;

class CalculationServiceTest {

    private CalculationService calculationService;

    @BeforeEach
    void setUp() {
        calculationService = new CalculationServiceImpl();
    }

    @Test
    void calculateTotalOrder_shouldIgnoreCancelledDetails() {
        OrderDetail served = new OrderDetail();
        served.setStatus(EOrderDetailStatus.SERVED);
        served.setTotalPrice(new BigDecimal("100.00"));

        OrderDetail cancelled = new OrderDetail();
        cancelled.setStatus(EOrderDetailStatus.CANCELLED);
        cancelled.setTotalPrice(new BigDecimal("50.00"));

        BigDecimal total = calculationService.calculateTotalOrder(List.of(served, cancelled));
        assertEquals(new BigDecimal("100.00"), total);
    }

    @Test
    void calculateVoucherDiscount_percentage_shouldRespectMaxDiscount() {
        Voucher voucher = new Voucher();
        voucher.setType(EVoucherType.PERCENTAGE);
        voucher.setDiscountValue(new BigDecimal("20"));
        voucher.setMaxDiscountValue(new BigDecimal("100.00"));

        BigDecimal discount = calculationService.calculateVoucherDiscount(new BigDecimal("800.00"), voucher);
        assertEquals(new BigDecimal("100.00"), discount);
    }

    @Test
    void calculateVoucherDiscount_fixedAmount_shouldNotExceedOrderAmount() {
        Voucher voucher = new Voucher();
        voucher.setType(EVoucherType.FIXED_AMOUNT);
        voucher.setDiscountValue(new BigDecimal("500.00"));

        BigDecimal discount = calculationService.calculateVoucherDiscount(new BigDecimal("300.00"), voucher);
        assertEquals(new BigDecimal("300.00"), discount);
    }

    @Test
    void calculateDepositPayment_shouldApplyTwentyPercentAndTableDeposit() {
        BigDecimal deposit = calculationService.calculateDepositPayment(new BigDecimal("500.00"), new BigDecimal("100.00"));
        assertEquals(new BigDecimal("200.00"), deposit);
    }

    @Test
    void calculateOrderPricing_shouldReturnTotalDiscountAndFinal() {
        Voucher voucher = new Voucher();
        voucher.setType(EVoucherType.PERCENTAGE);
        voucher.setDiscountValue(new BigDecimal("10"));
        voucher.setMaxDiscountValue(new BigDecimal("9999.00"));

        OrderDetail item1 = new OrderDetail();
        item1.setStatus(EOrderDetailStatus.SERVED);
        item1.setTotalPrice(new BigDecimal("200.00"));

        OrderDetail item2 = new OrderDetail();
        item2.setStatus(EOrderDetailStatus.PENDING);
        item2.setTotalPrice(new BigDecimal("100.00"));

        Order order = new Order();
        order.setOrderDetails(List.of(item1, item2));
        order.setVoucher(voucher);

        OrderPricingResult result = calculationService.calculateOrderPricing(order);

        assertEquals(new BigDecimal("300.00"), result.totalPrice());
        assertEquals(new BigDecimal("30.00"), result.discountPrice());
        assertEquals(new BigDecimal("270.00"), result.finalPrice());
    }
}
