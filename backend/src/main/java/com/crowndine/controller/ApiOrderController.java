package com.crowndine.controller;

import com.crowndine.common.enums.EOrderStatus;
import com.crowndine.dto.request.OrderItemBatchRequest;
import com.crowndine.dto.response.ApiResponse;
import com.crowndine.service.order.OrderService;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Min;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
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
                                    @RequestParam(required = false, defaultValue = "10") int size) {
        return ApiResponse.builder()
                .status(200)
                .message("Successfully retrieved all Orders")
                .data(orderService.getAllOrders(fromDate, toDate, status, page, size))
                .build();
    }

    @PostMapping
    public ApiResponse createOrder(@Valid @RequestBody OrderItemBatchRequest request, Principal principal) {
        orderService.createOrderByStaff(request, principal.getName());
        return ApiResponse.builder()
                .status(200)
                .message("Successfully created order + order details")
                .build();
    }

    @PutMapping("/{id}")
    public ApiResponse updateOrder(@Min(1) @PathVariable Long id, @Valid @RequestBody OrderItemBatchRequest request, Principal principal) {
        return ApiResponse.builder()
                .status(200)
                .message("Successfully created order + order details")
                .build();
    }
}
