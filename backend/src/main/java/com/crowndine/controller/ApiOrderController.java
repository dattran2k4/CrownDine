package com.crowndine.controller;

import com.crowndine.common.enums.EOrderStatus;
import com.crowndine.dto.request.OrderApplyVoucherRequest;
import com.crowndine.dto.request.OrderItemBatchRequest;
import com.crowndine.dto.request.OrderRequest;
import com.crowndine.dto.response.ApiResponse;
import com.crowndine.service.order.OrderService;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Min;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.time.LocalDate;

@RestController
@RequiredArgsConstructor
@Validated
@RequestMapping("/api/orders")
@Slf4j(topic = "API-ORDER-CONTROLLER")
public class ApiOrderController {

    private final OrderService orderService;

    @GetMapping
    public ApiResponse getAllOrders(@RequestParam(required = false) LocalDate fromDate,
                                    @RequestParam(required = false) LocalDate toDate,
                                    @RequestParam(required = false) EOrderStatus status,
                                    @RequestParam(required = false, defaultValue = "0") int page,
                                    @RequestParam(required = false, defaultValue = "50") int size) {
        return ApiResponse.builder()
                .status(200)
                .message("Successfully retrieved all Orders")
                .data(orderService.getAllOrders(fromDate, toDate, status, page, size))
                .build();
    }

    @PreAuthorize("hasAnyAuthority('STAFF', 'ADMIN')")
    @PostMapping
    public ApiResponse createOrder(@Valid @RequestBody OrderRequest request, Principal principal) {
        orderService.createWalkInOrder(request, principal.getName());
        return ApiResponse.builder()
                .status(200)
                .message("Successfully created order + details")
                .build();
    }

    @PreAuthorize("hasAnyAuthority('STAFF', 'ADMIN')")
    @PutMapping("/{id}")
    public ApiResponse updateOrder(@Min(1) @PathVariable Long id, @Valid @RequestBody OrderItemBatchRequest request, Principal principal) {
        return ApiResponse.builder()
                .status(200)
                .message("Successfully updated order + order details")
                .build();
    }

    @PreAuthorize("hasAnyAuthority('STAFF', 'ADMIN')")
    @PostMapping("/{orderId}/details")
    public ApiResponse addOrderDetails(@Min(1) @PathVariable("orderId") Long id, @Valid @RequestBody OrderItemBatchRequest request, Principal principal) {
        orderService.appendItemsToOrder(id, request, principal.getName());
        return ApiResponse.builder()
                .status(200)
                .message("Added order details successfully")
                .build();
    }

    @PostMapping("/{orderId}/voucher/apply")
    public ApiResponse applyVoucherToOrder(@Min(1) @PathVariable Long orderId,
                                           @Valid @RequestBody OrderApplyVoucherRequest request,
                                           Principal principal) {
        return ApiResponse.builder()
                .status(200)
                .message("Applied voucher to order successfully")
                .data(orderService.applyVoucherToOrder(orderId, request.getCode(), principal.getName()))
                .build();
    }

    @DeleteMapping("/{orderId}/voucher")
    public ApiResponse removeVoucherFromOrder(@Min(1) @PathVariable Long orderId, Principal principal) {
        return ApiResponse.builder()
                .status(200)
                .message("Removed voucher from order successfully")
                .data(orderService.removeVoucherFromOrder(orderId, principal.getName()))
                .build();
    }
}
