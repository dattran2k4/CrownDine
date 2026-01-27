package com.crowndine.controller;

import com.crowndine.dto.request.ShiftRequest;
import com.crowndine.dto.response.ApiResponse;
import com.crowndine.service.shift.ShiftService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;

@RestController
@Validated
@RequiredArgsConstructor
@RequestMapping("/api/shifts")
@Slf4j(topic = "API-SHIFT-CONTROLLER")
public class ApiShiftController {

    private final ShiftService shiftService;

    @GetMapping("/{id}")
    public ApiResponse getShift(@PathVariable Long id) {

        return ApiResponse.builder()
                .status(200)
                .message("Successfully retrieved shift")
                .data(shiftService.getShiftById(id))
                .build();
    }

    @GetMapping
    public ApiResponse getShifts() {

        return ApiResponse.builder()
                .status(200)
                .message("Successfully retrieved shifts")
                .data(shiftService.getAllShifts())
                .build();
    }

    @PostMapping
    public ApiResponse createShift(@Valid @RequestBody ShiftRequest request, Principal principal) {
        log.info("Request to create shift by user: {}", principal.getName());

        shiftService.saveShift(request, principal.getName());
        return ApiResponse.builder()
                .status(200)
                .message("Successfully retrieved shifts")
                .data(shiftService.getAllShifts())
                .build();
    }

}
