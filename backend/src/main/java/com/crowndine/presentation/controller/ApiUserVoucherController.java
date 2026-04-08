package com.crowndine.presentation.controller;

import com.crowndine.presentation.dto.response.ApiResponse;
import com.crowndine.core.service.voucher.UserVoucherService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.security.Principal;

@RestController
@Validated
@RequiredArgsConstructor
@RequestMapping("/api/user-vouchers")
@Slf4j(topic = "API-USER-VOUCHER-CONTROLLER")
public class ApiUserVoucherController {

    private final UserVoucherService userVoucherService;

    
    @GetMapping("/my")
    public ApiResponse getMyAvailableVouchers(Principal principal) {
        return ApiResponse.builder()
                .status(HttpStatus.OK.value())
                .message("Get my available vouchers successfully")
                .data(userVoucherService.getMyAvailableVouchers(principal.getName()))
                .build();
    }

    @PreAuthorize("hasAnyAuthority('ADMIN', 'STAFF')")
    @GetMapping("/customer/{customerId}")
    public ApiResponse getAvailableVouchersByCustomerId(@org.springframework.web.bind.annotation.PathVariable Long customerId) {
        return ApiResponse.builder()
                .status(200)
                .message("Get available vouchers by customer id successfully")
                .data(userVoucherService.getAvailableVouchersByCustomerId(customerId))
                .build();
    }
}
