package com.crowndine.controller;

import com.crowndine.common.enums.ETableStatus;
import com.crowndine.dto.response.ApiResponse;
import com.crowndine.service.layout.RestaurantTableService;
import jakarta.validation.constraints.Min;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.time.LocalTime;

@RestController
@Validated
@RequiredArgsConstructor
@RequestMapping("/api/restaurant-tables")
@Slf4j(topic = "API-RESTAURANT-TABLE-CONTROLLER")
public class ApiRestaurantTableController {

    private final RestaurantTableService restaurantTableService;

    @GetMapping("/available")
    public ApiResponse getAvailableTablesForReservation(@RequestParam LocalDate date,
                                                        @RequestParam LocalTime startTime,
                                                        @Min(1) @RequestParam Integer guestNumber) {
        log.info("Get available tables for guest number: {}", guestNumber);

        return ApiResponse.builder()
                .status(200)
                .message("Get available tables successfully")
                .data(restaurantTableService.getAvailableTablesForReservation(date, startTime, guestNumber))
                .build();
    }

    @GetMapping
    public ApiResponse getAllTables() {
        return ApiResponse.builder()
                .status(200)
                .message("Get all tables successfully")
                .data(restaurantTableService.getAllTables())
                .build();
    }

    @PatchMapping("/{id}")
    public ApiResponse updateStatusTable(@Min(1) @PathVariable Long id, @RequestParam ETableStatus status) {
        return ApiResponse.builder()
                .status(200)
                .message("Update table status successfully")
                .data(restaurantTableService.updateTableStatus(id, status))
                .build();
    }
}
