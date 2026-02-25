package com.crowndine.controller;

import com.crowndine.dto.response.ApiResponse;
import com.crowndine.service.layout.RestaurantTableService;
import com.crowndine.service.reservation.ReservationService;
import jakarta.validation.constraints.Min;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDate;
import java.time.LocalTime;

@RestController
@Validated
@RequiredArgsConstructor
@RequestMapping("/api/restaurent-tables")
@Slf4j(topic = "API-RESTAURANT-TABLE-CONTROLLER")
public class ApiRestaurantTableController {

    private final RestaurantTableService restaurantTableService;

    @GetMapping("/available")
    public ApiResponse getAvailableTablesForReservation(@RequestParam LocalDate date,
                                                        @RequestParam LocalTime startTime,
                                                        @RequestParam LocalTime endTime,
                                                        @Min(1) @RequestParam Integer guestNumber) {
        log.info("Get available tables for guest number: {}", guestNumber);

        return ApiResponse.builder()
                .status(200)
                .message("Get available tables successfully")
                .data(restaurantTableService.getAvailableTablesForReservation(date, startTime, endTime, guestNumber))
                .build();
    }
}
