package com.crowndine.controller;

import com.crowndine.common.enums.EOrderStatus;
import com.crowndine.dto.request.OrderRequest;
import com.crowndine.dto.response.ApiResponse;
import com.crowndine.service.order.OrderService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;

@RestController
@RequestMapping("/api/orders")
@RequiredArgsConstructor
@Validated
@Slf4j(topic = "API-ORDER-CONTROLLER")
public class ApiOrderController {

    private final OrderService orderService;

    @GetMapping
    public ApiResponse getOrdersByStaff(Principal principal) {
        return ApiResponse.builder()
                .status(200)
                .message("Successfully retrieved orders")
                .data(orderService.getOrderByUsername(principal.getName()))
                .build();
    }

    @PostMapping
    public ApiResponse createOrderByStaff(@Valid @RequestBody OrderRequest request, Principal principal) {
        orderService.saveOrder(request, principal.getName());
        return ApiResponse.builder()
                .status(HttpStatus.CREATED.value())
                .message("Order created successfully")
                .build();
    }

    @PatchMapping("/{id}")
    public ApiResponse updateOrderStatus(@PathVariable Long id, @RequestParam EOrderStatus status) {
        orderService.updateStatus(id, status);
        return ApiResponse.builder()
                .status(HttpStatus.ACCEPTED.value())
                .message("Order status updated successfully")
                .build();
    }
}
