package com.crowndine.presentation.controller;

import com.crowndine.common.enums.EVoucherType;
import com.crowndine.presentation.dto.request.VoucherAssignUsersRequest;
import com.crowndine.presentation.dto.request.VoucherRequest;
import com.crowndine.presentation.dto.request.VoucherValidateRequest;
import com.crowndine.presentation.dto.response.ApiResponse;
import com.crowndine.core.service.order.OrderVoucherService;
import com.crowndine.core.service.voucher.UserVoucherService;
import com.crowndine.core.service.voucher.VoucherService;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Min;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;

@RestController
@Validated
@RequiredArgsConstructor
@RequestMapping("/api/vouchers")
@Slf4j(topic = "API-VOUCHER-CONTROLLER")
public class ApiVoucherController {

    private final VoucherService voucherService;
    private final OrderVoucherService orderVoucherService;
    private final UserVoucherService userVoucherService;
    private final com.crowndine.core.service.user.RewardPointService rewardPointService;

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

    @PostMapping("/{id}/assign-users")
    public ApiResponse assignUsers(@Min(1) @PathVariable Long id,
                                   @Valid @RequestBody VoucherAssignUsersRequest request) {
        return ApiResponse.builder()
                .status(HttpStatus.OK.value())
                .message("Assign voucher to users successfully")
                .data(userVoucherService.assignUsers(id, request))
                .build();
    }

    @GetMapping("/{id}/assignments")
    public ApiResponse getAssignments(@Min(1) @PathVariable Long id) {
        return ApiResponse.builder()
                .status(HttpStatus.OK.value())
                .message("Get voucher assignments successfully")
                .data(userVoucherService.getVoucherAssignments(id))
                .build();
    }

    @PostMapping("/validate")
    public ApiResponse validateVoucher(@Valid @RequestBody VoucherValidateRequest request, Principal principal) {
        return ApiResponse.builder()
                .status(HttpStatus.OK.value())
                .message("Validate voucher successfully")
                .data(orderVoucherService.validateVoucherForOrder(request.getOrderId(), request.getCode(), principal.getName()))
                .build();
    }

    @PostMapping("/{id}/exchange")
    public ApiResponse exchangeVoucher(@Min(1) @PathVariable Long id, Principal principal) {
        rewardPointService.exchangeVoucher(id, principal.getName());
        return ApiResponse.builder()
                .status(HttpStatus.OK.value())
                .message("Đổi voucher thành công")
                .build();
    }
}
