package com.crowndine.controller;

import com.crowndine.dto.response.ApiResponse;
import com.crowndine.service.reservation.ReservationService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;

@RestController
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
        Pageable pageable = PageRequest.of(
                page,
                size,
                Sort.by(
                        Sort.Order.desc("date"),
                        Sort.Order.desc("startTime"),
                        Sort.Order.desc("createdAt")
                )
        );

        return ApiResponse.builder()
                .status(200)
                .message("Get reservation history successfully")
                .data(reservationService.getReservationHistory(principal.getName(), pageable))
                .build();
    }
}