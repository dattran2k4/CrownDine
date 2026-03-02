package com.crowndine.service.impl;

import com.crowndine.model.Order;
import com.crowndine.model.OrderDetail;
import com.crowndine.model.Reservation;
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
}

