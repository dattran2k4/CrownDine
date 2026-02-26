package com.crowndine.controller;

import com.crowndine.dto.request.OrderItemBatchRequest;
import com.crowndine.dto.request.ReservationCreateRequest;
import com.crowndine.dto.response.ApiResponse;
import com.crowndine.service.reservation.ReservationService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;

@RestController
@Validated
@RequiredArgsConstructor
@RequestMapping("/api/reservations")
@Slf4j(topic = "API-RESERVATION-CONTROLLER")
public class ApiReservationController {

    private final ReservationService reservationService;

    @GetMapping("/history")
    public ApiResponse getReservationHistory(
            Principal principal,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size
    ) {
        return ApiResponse.builder()
                .status(200)
                .message("Get reservation history successfully")
                .data(reservationService.getReservationHistory(principal.getName(), page, size))
                .build();
    }

    @GetMapping("/{reservationId}/order-details")
    public ApiResponse getReservationOrderDetails(
            @PathVariable Long reservationId) {
        return ApiResponse.builder()
                .status(200)
                .message("Get reservation order details successfully")
                .data(reservationService.getReservationOrderDetails(reservationId))
                .build();
    }

    @PostMapping("/create")
    public ApiResponse createReservation(@Valid @RequestBody ReservationCreateRequest request, Principal principal) {
        return ApiResponse.builder()
                .status(200)
                .message("Created reservation successfully")
                .data(reservationService.createReservation(principal.getName(), request))
                .build();
    }

    @PostMapping("/{reservationId}/add-items")
    public ApiResponse addOrderItems(@PathVariable Long reservationId,
                                     @Valid @RequestBody OrderItemBatchRequest request,
                                     Principal principal) {
        reservationService.addItemsToReservationOrder(reservationId, request, principal.getName());
        return ApiResponse.builder()
                .status(200)
                .message("Added items successfully")
                .build();
    }
}