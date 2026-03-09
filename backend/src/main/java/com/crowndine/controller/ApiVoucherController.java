package com.crowndine.controller;

import com.crowndine.common.enums.EVoucherType;
import com.crowndine.dto.request.VoucherRequest;
import com.crowndine.dto.response.ApiResponse;
import com.crowndine.service.voucher.VoucherService;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Min;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

@RestController
@Validated
@RequiredArgsConstructor
@RequestMapping("/api/vouchers")
@Slf4j(topic = "API-VOUCHER-CONTROLLER")
public class ApiVoucherController {

    private final VoucherService voucherService;

    @PostMapping
    public ApiResponse createVoucher(@Valid @RequestBody VoucherRequest request) {
        return ApiResponse.builder()
                .status(HttpStatus.CREATED.value())
                .message("Create voucher successfully")
                .data(voucherService.createVoucher(request))
                .build();
    }

    @GetMapping
    public ApiResponse getVouchers(@RequestParam(required = false) String search,
                                   @RequestParam(required = false) EVoucherType type,
                                   @Min(1) @RequestParam(required = false, defaultValue = "1") int page,
                                   @Min(1) @RequestParam(required = false, defaultValue = "10") int size) {
        return ApiResponse.builder()
                .status(HttpStatus.OK.value())
                .message("Get vouchers successfully")
                .data(voucherService.getVouchers(search, type, page, size))
                .build();
    }

    @GetMapping("/{id}")
    public ApiResponse getVoucherById(@Min(1) @PathVariable Long id) {
        return ApiResponse.builder()
                .status(HttpStatus.OK.value())
                .message("Get voucher successfully")
                .data(voucherService.getVoucherById(id))
                .build();
    }

    @PatchMapping("/{id}")
    public ApiResponse updateVoucher(@Min(1) @PathVariable Long id, @Valid @RequestBody VoucherRequest request) {
        return ApiResponse.builder()
                .status(HttpStatus.OK.value())
                .message("Update voucher successfully")
                .data(voucherService.updateVoucher(id, request))
                .build();
    }
}
