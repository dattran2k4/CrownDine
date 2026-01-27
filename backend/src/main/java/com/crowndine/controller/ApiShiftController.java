package com.crowndine.controller;

import com.crowndine.dto.request.ShiftRequest;
import com.crowndine.dto.response.ApiResponse;
import com.crowndine.service.shift.ShiftService;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Min;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

@RestController
@Validated
@RequiredArgsConstructor
@RequestMapping("/api/shifts")
@Slf4j(topic = "API-SHIFT-CONTROLLER")
public class ApiShiftController {

    private final ShiftService shiftService;

    @GetMapping("/{id}")
    public ApiResponse getShift(@Min(1) @PathVariable Long id) {

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
    public ApiResponse createShift(@Valid @RequestBody ShiftRequest request) {
        log.info("Request to create shift");

        request.setId(null);
        shiftService.saveShift(request);
        return ApiResponse.builder()
                .status(200)
                .message("Created shift successfully")
                .build();
    }

    @PutMapping("/{id}")
    public ApiResponse updateShift(@Valid @RequestBody ShiftRequest request, @Min(1) @PathVariable Long id) {
        log.info("Request to update shift");

        request.setId(id);
        shiftService.saveShift(request);
        return ApiResponse.builder()
                .status(200)
                .message("Updated shift successfully")
                .build();
    }

    @DeleteMapping("/{id}")
    public ApiResponse deleteShift(@Min(1) @PathVariable Long id) {
        log.info("Request to delete shift");

        shiftService.delete(id);
        return ApiResponse.builder()
                .status(200)
                .message("Deleted shift successfully")
                .build();
    }

}
