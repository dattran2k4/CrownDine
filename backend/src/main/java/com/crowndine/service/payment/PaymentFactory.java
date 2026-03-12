package com.crowndine.service.payment;

import com.crowndine.common.enums.EPaymentMethod;
import com.crowndine.exception.InvalidDataException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import java.util.Map;

@Component
@RequiredArgsConstructor
@Slf4j(topic = "PAYMENT-FACTORY")
public class PaymentFactory {

    private final Map<String, PaymentStrategy> strategyMap;

    public PaymentStrategy get(EPaymentMethod paymentMethod) {
        log.info("Getting payment strategy for {}", paymentMethod);
        // 1. Lấy tên bean từ Enum (VD: lấy ra chuỗi "PAYOS_SERVICE")
        String beanName = paymentMethod.getValue();

        // 2. Tìm trong Map của Spring
        PaymentStrategy strategy = strategyMap.get(beanName);

        // 3. Validate
        if (strategy == null) {
            throw new InvalidDataException("Không tìm thấy Service xử lý cho phương thức: " + paymentMethod);
        }

        return strategy;
    }
}
