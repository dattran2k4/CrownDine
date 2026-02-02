package com.crowndine.service.impl.payment;

import com.crowndine.common.enums.EPaymentMethod;
import com.crowndine.common.enums.EPaymentStatus;
import com.crowndine.common.enums.EPaymentTarget;
import com.crowndine.common.enums.EPaymentType;
import com.crowndine.common.utils.CodeUtils;
import com.crowndine.dto.request.PaymentRequest;
import com.crowndine.exception.InvalidDataException;
import com.crowndine.model.Order;
import com.crowndine.model.Payment;
import com.crowndine.repository.PaymentRepository;
import com.crowndine.service.order.OrderService;
import com.crowndine.service.payment.PaymentStrategy;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

import java.math.BigDecimal;
import java.util.List;

@Service("cash")
@RequiredArgsConstructor
@Slf4j(topic = "CASH-SERVICE")
public class CashService implements PaymentStrategy<Object> {

    private final PaymentRepository paymentRepository;
    private final OrderService orderService;

    @Override
    public String createPaymentLink(PaymentRequest request, String username) {
        log.info("Processing create payment: ");

        Payment payment = new Payment();
        payment.setStatus(EPaymentStatus.SUCCESS);
        payment.setMethod(EPaymentMethod.CASH);
        EPaymentTarget target;

        BigDecimal amountToPay;

        Long code = CodeUtils.generatePaymentCode();
        payment.setCode(code);

        if (StringUtils.hasText(request.getOrderCode())) {
            throw new InvalidDataException("Order code is mandatory");
        }

        Order order = orderService.getOrderByCode(request.getOrderCode());
        target = EPaymentTarget.ORDER;
        payment.setOrder(order);
        payment.setTarget(target);
        payment.setType(EPaymentType.SETTLEMENT);
        amountToPay = order.getFinalPrice();

        //Kiểm tra có đặt bàn hay chưa để tính phần còn lại
        if (order.getReservation() != null) {
            List<Payment> depositPayments = paymentRepository.findByTargetAndReservationIdAndStatus(
                    EPaymentTarget.RESERVATION,
                    order.getReservation().getId(),
                    EPaymentStatus.SUCCESS
            );

            // Cộng tổng số tiền đã cọc
            BigDecimal totalDeposited = BigDecimal.ZERO;
            for (Payment p : depositPayments) {
                totalDeposited = totalDeposited.add(p.getAmount());
            }

            // Trừ tiền: Tiền phải trả = Tổng bill - Tổng cọc
            amountToPay = amountToPay.subtract(totalDeposited);
            log.info("Order {} - Total: {}, Deposit: {}, Remaining: {}",
                    order.getId(), order.getFinalPrice(), totalDeposited, amountToPay);
        }

        payment.setAmount(amountToPay);


        Payment savedPayment = paymentRepository.save(payment);
        log.info("Payment id {} saved with status={}, target={}", savedPayment.getId(), savedPayment.getStatus(), savedPayment.getTarget());

        return "Đã tạo thành công số tiền thành toán là" + amountToPay;
    }

    @Override
    public void handleWebHook(Object webHookData) {
        throw new UnsupportedOperationException("Not supported yet.");
    }
}
