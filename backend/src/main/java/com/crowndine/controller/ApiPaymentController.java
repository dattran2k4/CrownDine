package com.crowndine.controller;

import com.crowndine.common.enums.EPaymentMethod;
import com.crowndine.dto.request.PaymentFilterRequest;
import com.crowndine.dto.request.PaymentRequest;
import com.crowndine.dto.response.ApiResponse;
import com.crowndine.service.payment.PaymentFactory;
import com.crowndine.service.payment.PaymentService;
import com.crowndine.service.payment.PaymentStrategy;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Min;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.Map;


@RestController
@RequestMapping("/api/payments")
@RequiredArgsConstructor
@Validated
@Slf4j(topic = "API-PAYMENT-CONTROLLER")
public class ApiPaymentController {

    private final PaymentFactory paymentFactory;
    private final PaymentService paymentService;

    @PreAuthorize("isAuthenticated()")
    @PostMapping("/create")
    public ApiResponse createPaymentLink(@Valid @RequestBody PaymentRequest request, Principal principal) {
        log.info("Request to create payment link");
        PaymentStrategy strategy = paymentFactory.get(request.getMethod());
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
            paymentFactory.get(EPaymentMethod.PAYOS).handleWebHook(body);
        } catch (Exception e) {
            log.error("Exception occurred while handling payment request {}, message = {}", e, e.getMessage());
        }
    }

    @PreAuthorize("hasAuthority('ADMIN')")
    @GetMapping
    public ApiResponse getPaymentList(PaymentFilterRequest request,
                                      @Min(1) @RequestParam(required = false, defaultValue = "1") int page,
                                      @Min(1) @RequestParam(required = false, defaultValue = "10") int size) {

        return ApiResponse.builder()
                .status(HttpStatus.OK.value())
                .message("Successfully retrieved payment list")
                .data(paymentService.getPayments(request, page, size))
                .build();
    }

    @PreAuthorize("hasAuthority('ADMIN')")
    @GetMapping("/{id}")
    public ApiResponse getPaymentDetail(@Min(1) @PathVariable Long id) {

        return ApiResponse.builder()
                .status(HttpStatus.OK.value())
                .message("Successfully retrieved payment detail")
                .data(paymentService.getPaymentDetail(id))
                .build();
    }
}
