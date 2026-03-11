package com.crowndine.service.impl;

import com.crowndine.common.enums.EOrderDetailStatus;
import com.crowndine.common.enums.EVoucherType;
import com.crowndine.model.OrderDetail;
import com.crowndine.model.Voucher;
import com.crowndine.service.CalculationService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.List;

@Service
@Slf4j(topic = "CALCULATE-SERVICE")
public class CalculationServiceImpl implements CalculationService {

    public static final BigDecimal DEPOSIT_RATE = new BigDecimal("0.20");

    @Override
    public BigDecimal calculateTotalOrder(List<OrderDetail> details) {
        return details.stream()
                .filter(d -> d.getStatus() != (EOrderDetailStatus.CANCELLED))
                .map(OrderDetail::getTotalPrice)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
    }

    @Override
    public BigDecimal calculateDepositPayment(BigDecimal itemsTotal, BigDecimal tableDeposit) {
        if (itemsTotal == null) itemsTotal = BigDecimal.ZERO;
        if (tableDeposit == null) tableDeposit = BigDecimal.ZERO;

        return itemsTotal.multiply(DEPOSIT_RATE)
                .add(tableDeposit)
                .setScale(2, RoundingMode.HALF_UP);
    }

    @Override
    public BigDecimal calculateVoucherDiscount(BigDecimal orderAmount, Voucher voucher) {
        if (orderAmount == null || orderAmount.compareTo(BigDecimal.ZERO) <= 0) {
            return BigDecimal.ZERO.setScale(2, RoundingMode.HALF_UP);
        }

        BigDecimal discountValue = voucher.getDiscountValue();
        if (discountValue == null || discountValue.compareTo(BigDecimal.ZERO) <= 0) {
            return BigDecimal.ZERO.setScale(2, RoundingMode.HALF_UP);
        }

        BigDecimal discountAmount;
        if (voucher.getType().equals(EVoucherType.PERCENTAGE)) {
            //DISCOUNT = ORDER * VOUCHER %
            discountAmount = orderAmount.multiply(discountValue).divide(BigDecimal.valueOf(100), 2, RoundingMode.HALF_UP);
        } else {
            discountAmount = discountValue;
        }

        if (voucher.getMaxDiscountValue() != null
                && discountAmount.compareTo(voucher.getMaxDiscountValue()) > 0) {
            discountAmount = voucher.getMaxDiscountValue();
        }

        if (discountAmount.compareTo(orderAmount) > 0) {
            discountAmount = orderAmount;
        }

        return discountAmount.setScale(2, RoundingMode.HALF_UP);
    }

    @Override
    public BigDecimal calculateFinalTotalPrice(BigDecimal totalPrice, BigDecimal discountPrice) {
        BigDecimal finalPrice = totalPrice.subtract(discountPrice);
        if (finalPrice.compareTo(BigDecimal.ZERO) < 0) {
            finalPrice = BigDecimal.ZERO;
        }
        return finalPrice;
    }
}
