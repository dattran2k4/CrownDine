package com.crowndine.controller;

import com.crowndine.service.voucher.VoucherService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@Validated
@RequiredArgsConstructor
@RequestMapping("/api/vouchers")
@Slf4j(topic = "API-VOUCHER-CONTROLLER")
public class ApiVoucherController {

    private final VoucherService voucherService;
}
