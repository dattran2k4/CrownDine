package com.crowndine.service.impl.payment;

import com.crowndine.common.enums.EPaymentMethod;
import com.crowndine.common.enums.EPaymentStatus;
import com.crowndine.dto.request.PaymentRequest;
import com.crowndine.exception.InvalidDataException;
import com.crowndine.model.Order;
import com.crowndine.service.order.OrderService;
import com.crowndine.service.payment.AbstractPaymentStrategy;
import com.crowndine.service.payment.PaymentPreparationService;
import com.crowndine.service.payment.PreparedPayment;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

import java.math.BigDecimal;
import java.util.Map;

@Service("cash")
@Slf4j(topic = "CASH-SERVICE")
public class CashService extends AbstractPaymentStrategy {

    private final OrderService orderService;

    public CashService(PaymentPreparationService paymentPreparationService, OrderService orderService) {
        super(paymentPreparationService);
        this.orderService = orderService;
    }

    @Override
    protected void validateRequest(PaymentRequest request) {
        super.validateRequest(request);
        if (StringUtils.hasText(request.getReservationCode())) {
            throw new InvalidDataException("Thanh toán tiền mặt chỉ áp dụng cho đơn hàng");
        }
    }

    @Override
    protected EPaymentMethod getMethod() {
        return EPaymentMethod.CASH;
    }

    @Override
    protected EPaymentStatus getInitialStatus() {
        return EPaymentStatus.SUCCESS;
    }

    @Override
    protected String doCreatePayment(PreparedPayment prepared) {
        BigDecimal amountToPay = prepared.amount();
        Order order = prepared.payment().getOrder();
        if (order == null) {
            throw new InvalidDataException("Cash payment chỉ áp dụng cho đơn hàng");
        }

        orderService.markAsPaid(order);
        log.info("Cash payment created, code={}, amount={}", prepared.payment().getCode(), amountToPay);
        return "Đã tạo thành công số tiền thành toán là " + amountToPay;
    }

    @Override
    public void handleWebHook(Map<String, Object> body) {
        throw new UnsupportedOperationException("Not supported yet.");
    }
}
