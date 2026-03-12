package com.crowndine.controller;

import com.crowndine.dto.request.PaymentRequest;
import com.crowndine.dto.response.ApiResponse;
import com.crowndine.service.impl.payment.PayOSService;
import com.crowndine.service.payment.PaymentFactory;
import com.crowndine.service.payment.PaymentStrategy;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import vn.payos.PayOS;
import vn.payos.model.webhooks.WebhookData;

import java.security.Principal;
import java.util.Map;


@RestController
@RequestMapping("/api/payments")
@RequiredArgsConstructor
@Validated
@Slf4j(topic = "API-PAYMENT-CONTROLLER")
public class ApiPaymentController {

    private final PaymentFactory paymentFactory;
    private final PayOS payOS;
    private final PayOSService payOSService;

    @PostMapping("/create")
    public ApiResponse createPaymentLink(@Valid @RequestBody PaymentRequest request, Principal principal) {
        log.info("Request to create payment link");
        PaymentStrategy<?> strategy = paymentFactory.get(request.getMethod());
        return ApiResponse.builder()
                .status(HttpStatus.CREATED.value())
                .message("Successfully created payment link")
                .data(strategy.createPaymentLink(request, principal.getName()))
                .build();
    }

    @PostMapping("/payos-ipn")
    public void handleWebhook(@RequestBody Map<String, Object> body) {
        try {
            log.info("PayOS return received: {}", body);
            WebhookData data = payOS.webhooks().verify(body);
            payOSService.handleWebHook(data);
        } catch (Exception e) {
            log.error("Exception occurred while handling payment request {}, message = {}", e, e.getMessage());
        }
    }
}
