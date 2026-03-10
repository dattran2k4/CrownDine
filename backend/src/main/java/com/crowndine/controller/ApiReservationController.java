package com.crowndine.controller;

import com.crowndine.dto.request.*;
import com.crowndine.dto.response.ApiResponse;
import com.crowndine.dto.validator.EnumValue;
import com.crowndine.service.reservation.ReservationService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.Map;

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
                .status(201)
                .message("Created reservation successfully")
                .data(reservationService.createReservation(principal.getName(), request))
                .build();
    }

    @PostMapping("/{reservationId}/add-item")
    public ApiResponse addOrderItem(@PathVariable Long reservationId,
                                    @Valid @RequestBody OrderItemRequest request,
                                    Principal principal) {
        reservationService.addItemToReservationOrder(reservationId, request, principal.getName());
        return ApiResponse.builder()
                .status(201)
                .message("Added item successfully")
                .build();
    }

    @PutMapping("/{reservationId}/upd-item")
    public ApiResponse updateOrderItem(@PathVariable Long reservationId,
                                       @Valid @RequestBody OrderItemRequest request,
                                       Principal principal) {
        reservationService.updateItemInReservation(reservationId, request, principal.getName());
        return ApiResponse.builder()
                .status(200)
                .message("Updated item successfully")
                .build();
    }


    @DeleteMapping("/{reservationId}/remove-item")
    public ApiResponse deleteOrderItem(@PathVariable Long reservationId,
                                       @Valid @RequestBody OrderItemRemoveRequest request,
                                       Principal principal) {
        reservationService.removeItemFromReservation(reservationId, request, principal.getName());
        return ApiResponse.builder()
                .status(200)
                .message("Removed item successfully")
                .build();
    }

    @PostMapping("/{reservationId}/add-items")
    public ApiResponse addOrderItems(@PathVariable Long reservationId,
                                     @Valid @RequestBody OrderItemBatchRequest request,
                                     Principal principal) {
        reservationService.addItemsToReservationOrder(reservationId, request, principal.getName());
        return ApiResponse.builder()
                .status(200)
                .message("Deleted items successfully")
                .build();
    }

    @DeleteMapping("/{reservationId}/cancel")
    public ApiResponse cancelReservation(@PathVariable Long reservationId, Principal principal) {
        reservationService.cancelReservation(reservationId, principal.getName());
        return ApiResponse.builder()
                .status(200)
                .message("Cancelled reservation successfully")
                .build();
    }

    @PutMapping("/{reservationId}/update-table")
    public ApiResponse updateReservationTable(@PathVariable Long reservationId,
                                              @Valid @RequestBody ReservationUpdateTableRequest request,
                                              Principal principal) {
        reservationService.updateReservationTable(reservationId, request, principal.getName());
        return ApiResponse.builder()
                .status(200)
                .message("Updated reservation table successfully")
                .build();
    }
}