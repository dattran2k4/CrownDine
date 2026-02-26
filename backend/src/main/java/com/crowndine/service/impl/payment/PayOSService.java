package com.crowndine.service.impl.payment;

import com.crowndine.common.enums.*;
import com.crowndine.common.utils.CodeUtils;
import com.crowndine.config.PayOSConfig;
import com.crowndine.dto.request.PaymentRequest;
import com.crowndine.exception.InvalidDataException;
import com.crowndine.exception.ResourceNotFoundException;
import com.crowndine.model.*;
import com.crowndine.repository.PaymentRepository;
import com.crowndine.service.CalculationService;
import com.crowndine.service.order.OrderService;
import com.crowndine.service.payment.PaymentStrategy;
import com.crowndine.service.reservation.ReservationService;
import com.crowndine.service.user.UserService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;
import vn.payos.PayOS;
import vn.payos.model.v2.paymentRequests.CreatePaymentLinkRequest;
import vn.payos.model.v2.paymentRequests.CreatePaymentLinkResponse;
import vn.payos.model.v2.paymentRequests.PaymentLinkItem;
import vn.payos.model.webhooks.WebhookData;

import java.math.BigDecimal;
import java.util.List;

@Service("payos")
@RequiredArgsConstructor
@Slf4j(topic = "PAYOS-SERVICE")
public class PayOSService implements PaymentStrategy<WebhookData> {

    private final PayOSConfig payOSConfig;
    private final PayOS payOS;
    private final PaymentRepository paymentRepository;
    private final ReservationService reservationService;
    private final OrderService orderService;
    private final UserService userService;
    private final CalculationService calculationService;

    @Override
    @Transactional(rollbackFor = Exception.class)
    public String createPaymentLink(PaymentRequest request, String username) {
        log.info("Processing create payment link for user {} ", username);

        User user = userService.getUserByUserName(username);

        Payment payment = new Payment();
        payment.setStatus(EPaymentStatus.PENDING);
        payment.setMethod(EPaymentMethod.PAYOS);
        payment.setCreatedBy(user);

        BigDecimal amountToPay;

        Long code = CodeUtils.generatePaymentCode();
        log.info("orderCode: {}", code);
        payment.setCode(code);

        String description;

        if (StringUtils.hasText(request.getReservationCode())) {
            Reservation reservation = reservationService.getReservationByCode(request.getReservationCode());
            payment.setReservation(reservation);
            payment.setTarget(EPaymentTarget.RESERVATION);
            payment.setSource(EPaymentSource.CLIENT_APP);

            List<OrderDetail> orderDetails = reservation.getOrder().getOrderDetails();
            BigDecimal totalOrder = calculationService.calculateTotalOrder(orderDetails);

            amountToPay = calculationService.calculateDepositPayment(totalOrder, reservation.getTable().getBaseDeposit());

            payment.setAmount(amountToPay);
            payment.setType(EPaymentType.DEPOSIT);
            description = "Thanh toán đặt cọc bàn";
        } else {
            Order order = orderService.getOrderByCode(request.getOrderCode());
            payment.setSource(EPaymentSource.POS_COUNTER);
            payment.setOrder(order);
            payment.setTarget(EPaymentTarget.ORDER);
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

            description = "Thanh toán đơn hàng";
        }

        Payment savedPayment = paymentRepository.save(payment);
        log.info("Payment id {} saved with status={}, target={}", savedPayment.getId(), savedPayment.getStatus(), savedPayment.getTarget());

        PaymentLinkItem item = PaymentLinkItem.builder()
                .name("CrownDine Restaurant")
                .quantity(1)
                .price(amountToPay.longValue())
                .build();

        CreatePaymentLinkRequest paymentData = CreatePaymentLinkRequest.builder()
                .orderCode(code)
                .amount(amountToPay.longValue())
                .description(description)
                .returnUrl(payOSConfig.getReturnPaymentSuccessUrl())
                .cancelUrl(payOSConfig.getReturnPaymentCancelUrl())
                .item(item)
                .build();

        try {
            CreatePaymentLinkResponse data = payOS.paymentRequests().create(paymentData);
            log.info("Created payment link successfully");

            return data.getCheckoutUrl();
        } catch (Exception ex) {
            savedPayment.setStatus(EPaymentStatus.FAILED);
            paymentRepository.save(savedPayment);

            log.error("Payment link could not be created, message={}", ex.getMessage(), ex);
            throw new InvalidDataException("Cannot create PayOS payment link", ex);
        }
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public void handleWebHook(WebhookData data) {
        Long orderCode = data.getOrderCode();
        log.info("Processing PAYOS webhook for orderCode: {}", orderCode);
        try {

            Payment payment = paymentRepository.findByCode(orderCode).orElseThrow(() -> new ResourceNotFoundException("Payment not found"));

            payment.setStatus(EPaymentStatus.SUCCESS);
            payment.setTransactionCode(data.getReference());
            paymentRepository.save(payment);
            log.info("Payment id {} saved with status={}", payment.getId(), payment.getStatus());
        } catch (Exception e) {
            log.error("Error while handling PayOS webhook: {}", e.getMessage(), e);
        }
    }
}
