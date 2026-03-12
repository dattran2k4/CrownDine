package com.crowndine.service.impl.payment;

import com.crowndine.common.enums.EPaymentMethod;
import com.crowndine.common.enums.EPaymentStatus;
import com.crowndine.common.enums.EReservationStatus;
import com.crowndine.config.PayOSConfig;
import com.crowndine.exception.InvalidDataException;
import com.crowndine.exception.ResourceNotFoundException;
import com.crowndine.model.Payment;
import com.crowndine.model.Reservation;
import com.crowndine.repository.PaymentRepository;
import com.crowndine.service.payment.AbstractPaymentStrategy;
import com.crowndine.service.payment.PaymentPreparationService;
import com.crowndine.service.payment.PreparedPayment;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import vn.payos.PayOS;
import vn.payos.model.v2.paymentRequests.CreatePaymentLinkRequest;
import vn.payos.model.v2.paymentRequests.CreatePaymentLinkResponse;
import vn.payos.model.v2.paymentRequests.PaymentLinkItem;
import vn.payos.model.webhooks.WebhookData;

import java.math.BigDecimal;

@Service("payos")
@Slf4j(topic = "PAYOS-SERVICE")
public class PayOSService extends AbstractPaymentStrategy<WebhookData> {

    private final PayOSConfig payOSConfig;
    private final PayOS payOS;
    private final PaymentRepository paymentRepository;

    public PayOSService(PaymentPreparationService paymentPreparationService,
                        PayOSConfig payOSConfig,
                        PayOS payOS,
                        PaymentRepository paymentRepository) {
        super(paymentPreparationService);
        this.payOSConfig = payOSConfig;
        this.payOS = payOS;
        this.paymentRepository = paymentRepository;
    }

    @Override
    protected EPaymentMethod getMethod() {
        return EPaymentMethod.PAYOS;
    }

    @Override
    protected EPaymentStatus getInitialStatus() {
        return EPaymentStatus.PENDING;
    }

    @Override
    protected String doCreatePayment(PreparedPayment prepared) {
        Payment payment = prepared.payment();
        BigDecimal amountToPay = prepared.amount();
        String description = prepared.description();

        log.info("Processing create payment link for code {} ", payment.getCode());

        PaymentLinkItem item = PaymentLinkItem.builder()
                .name("CrownDine Restaurant")
                .quantity(1)
                .price(amountToPay.longValue())
                .build();

        CreatePaymentLinkRequest paymentData = CreatePaymentLinkRequest.builder()
                .orderCode(payment.getCode())
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
            payment.setStatus(EPaymentStatus.FAILED);
            paymentRepository.save(payment);

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
            String rawApiData = data.toString().replace("WebhookData(", "").replace(")", "");
            payment.setRawApiData(rawApiData);
            paymentRepository.save(payment);

            Reservation reservation = payment.getReservation();
            reservation.setStatus(EReservationStatus.CONFIRMED);
            reservation.setExpiratedAt(null);

            log.info("Payment id {} saved with status={}", payment.getId(), payment.getStatus());
        } catch (Exception e) {
            log.error("Error while handling PayOS webhook: {}", e.getMessage(), e);
        }
    }
}
