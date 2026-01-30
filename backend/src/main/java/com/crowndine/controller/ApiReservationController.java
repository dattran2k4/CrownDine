package com.crowndine.controller;

import com.crowndine.dto.request.ReservationCreateRequest;
import com.crowndine.dto.response.ApiResponse;
import com.crowndine.service.reservation.ReservationService;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Min;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.time.LocalDate;
import java.time.LocalTime;

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
        @PathVariable Long reservationId){
        return ApiResponse.builder()
                .status(200)
                .message("Get reservation order details successfully")
                .data(reservationService.getReservationOrderDetails(reservationId))
                .build();
    }

    @GetMapping("/available-tables")
    public ApiResponse getAvailableTables(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.TIME) LocalTime startTime,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.TIME) LocalTime endTime,
            @RequestParam @Min(1) Integer guestNumber
    ) {
        log.info("Find available tables date={} start={} end={} guest={}", date, startTime, endTime, guestNumber);
        return ApiResponse.builder()
                .status(200)
                .message("Get available tables successfully")
                .data(reservationService.findAvailableTables(date, startTime, endTime, guestNumber))
                .build();
    }

    @PostMapping
    public ApiResponse createReservation(
            @Valid @RequestBody ReservationCreateRequest request,
            Principal principal
    ) {
        return ApiResponse.builder()
                .status(200)
                .message("Create reservation successfully")
                .data(reservationService.createReservation(principal.getName(), request))
                .build();
    }

    @PostMapping("/select-table")
    public ApiResponse selectTable(
            @Valid @RequestBody ReservationCreateRequest request,
            Principal principal
    ) {
        return ApiResponse.builder()
                .status(200)
                .message("Select table successfully")
                .data(reservationService.createReservation(principal.getName(), request))
                .build();
    }
}