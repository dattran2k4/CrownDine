package com.crowndine.controller;

import com.crowndine.dto.request.*;
import com.crowndine.dto.response.ApiResponse;
import com.crowndine.service.reservation.ReservationLifecycleService;
import com.crowndine.service.reservation.ReservationOrderService;
import com.crowndine.service.reservation.ReservationService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import com.crowndine.common.enums.EReservationStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.time.LocalDate;

@RestController
@Validated
@RequiredArgsConstructor
@RequestMapping("/api/reservations")
@Slf4j(topic = "API-RESERVATION-CONTROLLER")
public class ApiReservationController {

    private final ReservationService reservationService;
    private final ReservationLifecycleService reservationLifecycleService;
    private final ReservationOrderService reservationOrderService;

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

    @GetMapping("/all")
    public ApiResponse getAllReservations(
            @RequestParam(required = false) LocalDate fromDate,
            @RequestParam(required = false) LocalDate toDate,
            @RequestParam(required = false) EReservationStatus status,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size
    ) {
        return ApiResponse.builder()
                .status(200)
                .message("Get all reservations for staff/admin successfully")
                .data(reservationService.getAllReservations(fromDate, toDate, status, page, size))
                .build();
    }

    @GetMapping("/{reservationId}/order-details")
    public ApiResponse getReservationOrderDetails(
            @PathVariable Long reservationId) {
        return ApiResponse.builder()
                .status(200)
                .message("Get reservation order details successfully")
                .data(reservationOrderService.getReservationOrderDetails(reservationId))
                .build();
    }

    @PostMapping("/create")
    public ApiResponse createReservation(@Valid @RequestBody ReservationCreateRequest request, Principal principal) {
        return ApiResponse.builder()
                .status(200)
                .message("Created reservation successfully")
                .data(reservationLifecycleService.createReservationByCustomer(principal.getName(), request))
                .build();
    }

    @PreAuthorize("hasAnyAuthority('STAFF', 'ADMIN')")
    @PostMapping("/staff-create")
    public ApiResponse createWalkInReservationByStaff(@Valid @RequestBody StaffReservationCreateRequest request, Principal principal) {
        return ApiResponse.builder()
                .status(200)
                .message("Created reservation successfully")
                .data(reservationLifecycleService.createWalkInReservationByStaff(principal.getName(), request))
                .build();
    }

    @PreAuthorize("hasAnyAuthority('STAFF', 'ADMIN')")
    @PostMapping("/{reservationId}/check-in")
    public ApiResponse checkInReservation(@PathVariable Long reservationId, Principal principal) {
        reservationLifecycleService.checkInReservation(reservationId, principal.getName());
        return ApiResponse.builder()
                .status(200)
                .message("Checked in reservation successfully")
                .build();
    }

    @PostMapping("/{reservationId}/add-item")
    public ApiResponse addOrderItem(@PathVariable Long reservationId,
                                    @Valid @RequestBody OrderItemRequest request,
                                    Principal principal) {
        reservationOrderService.addItemToReservationOrder(reservationId, request, principal.getName());
        return ApiResponse.builder()
                .status(201)
                .message("Added item successfully")
                .build();
    }

    @PutMapping("/{reservationId}/upd-item")
    public ApiResponse updateOrderItem(@PathVariable Long reservationId,
                                       @Valid @RequestBody OrderItemRequest request,
                                       Principal principal) {
        reservationOrderService.updateReservationOrderItem(reservationId, request, principal.getName());
        return ApiResponse.builder()
                .status(200)
                .message("Updated item successfully")
                .build();
    }


    @DeleteMapping("/{reservationId}/remove-item")
    public ApiResponse deleteOrderItem(@PathVariable Long reservationId,
                                       @Valid @RequestBody OrderItemRemoveRequest request,
                                       Principal principal) {
        reservationOrderService.removeReservationOrderItem(reservationId, request, principal.getName());
        return ApiResponse.builder()
                .status(200)
                .message("Removed item successfully")
                .build();
    }

    @DeleteMapping("/{reservationId}/cancel")
    public ApiResponse cancelReservation(@PathVariable Long reservationId, Principal principal) {
        reservationLifecycleService.cancelReservation(reservationId, principal.getName());
        return ApiResponse.builder()
                .status(200)
                .message("Cancelled reservation successfully")
                .build();
    }

    @PreAuthorize("hasAnyAuthority('STAFF', 'ADMIN')")
    @PostMapping("/{reservationId}/cancel")
    public ApiResponse cancelReservationByStaff(@PathVariable Long reservationId, Principal principal) {
        reservationLifecycleService.cancelReservationByStaff(reservationId, principal.getName());
        return ApiResponse.builder()
                .status(200)
                .message("Cancelled reservation successfully")
                .build();
    }

    @PreAuthorize("hasAnyAuthority('STAFF', 'ADMIN')")
    @PostMapping("/{reservationId}/no-show")
    public ApiResponse markReservationNoShow(@PathVariable Long reservationId, Principal principal) {
        reservationLifecycleService.markReservationNoShow(reservationId, principal.getName());
        return ApiResponse.builder()
                .status(200)
                .message("Marked reservation as no-show successfully")
                .build();
    }

    @PreAuthorize("hasAnyAuthority('STAFF', 'ADMIN')")
    @PostMapping("/{reservationId}/complete")
    public ApiResponse completeReservation(@PathVariable Long reservationId, Principal principal) {
        reservationLifecycleService.completeReservation(reservationId, principal.getName());
        return ApiResponse.builder()
                .status(200)
                .message("Completed reservation successfully")
                .build();
    }

    @PutMapping("/{reservationId}/update-table")
    public ApiResponse updateReservationTable(@PathVariable Long reservationId,
                                              @Valid @RequestBody ReservationUpdateTableRequest request,
                                              Principal principal) {
        reservationLifecycleService.updateReservationTable(reservationId, request, principal.getName());
        return ApiResponse.builder()
                .status(200)
                .message("Updated reservation table successfully")
                .build();
    }
}
