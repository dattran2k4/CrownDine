package com.crowndine.controller;

import com.crowndine.common.enums.EWorkScheduleStatus;
import com.crowndine.dto.request.WorkScheduleCreateRequest;
import com.crowndine.dto.request.WorkScheduleUpdateRequest;
import com.crowndine.dto.response.ApiResponse;
import com.crowndine.exception.ResourceNotFoundException;
import com.crowndine.repository.ShiftRepository;
import com.crowndine.repository.UserRepository;
import com.crowndine.repository.WorkScheduleRepository;
import com.crowndine.service.user.UserService;
import com.crowndine.service.workschedule.WorkScheduleService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.Collections;

@RestController
@Validated
@RequiredArgsConstructor
@RequestMapping("/api/work-schedules")
@Slf4j(topic = "API-WORK-SCHEDULE-CONTROLLER")
public class ApiWorkScheduleController {

    private final WorkScheduleService workScheduleService;
    private final WorkScheduleRepository workScheduleRepository;
    private final UserRepository userRepository;
    private final UserService userService;
    private final ShiftRepository shiftRepository;

    @GetMapping
    @PreAuthorize("hasAuthority('ADMIN')")
    public ApiResponse getWorkSchedules(@RequestParam(required = false) LocalDate fromDate,
                                        @RequestParam(required = false) LocalDate toDate,
                                        @RequestParam(required = false) LocalDate date,
                                        @RequestParam(required = false) EWorkScheduleStatus status,
                                        @RequestParam(required = false) Long userId,
                                        @RequestParam(required = false) Long shiftId) {

        return ApiResponse.builder()
                .status(200)
                .message("Get work schedules successfully")
                .data(workScheduleService.getWorkSchedules(fromDate, toDate, date, status, userId, shiftId))
                .build();
    }

    @PostMapping("/create")
    @PreAuthorize("hasAuthority('ADMIN')")
    public ResponseEntity<?> createWorkSchedule(@Valid @RequestBody WorkScheduleCreateRequest request) {
        log.info("Request to create work schedule: {}", request);
        long count = workScheduleService.createWorkSchedule(request);

        if (count > 0) {
            return ResponseEntity.ok().body(Collections.singletonMap("message", "ok"));
        }
        return ResponseEntity.badRequest().body(Collections.singletonMap("message", "error"));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAuthority('ADMIN')")
    public ApiResponse updateWorkSchedules(@PathVariable Long id, @RequestBody WorkScheduleUpdateRequest request) {
        log.info("Request to update work schedules");
        workScheduleService.reassignWorkSchedules(request, id);

        return ApiResponse.builder()
                .status(HttpStatus.ACCEPTED.value())
                .message("Update work schedules by date successfully")
                .build();
    }

    @PatchMapping("/{id}/approve")
    @PreAuthorize("hasAuthority('ADMIN')")
    public ApiResponse approveWorkSchedule(@PathVariable("id") Long id, @RequestParam EWorkScheduleStatus status) {
        workScheduleService.changeWorkScheduleStatus(id, status);

        return ApiResponse.builder()
                .status(200)
                .message("Update work schedule status successfully")
                .build();
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAuthority('ADMIN')")
    public ApiResponse deleteWorkSchedule(@PathVariable("id") Long id) {
        log.info("Request to delete work schedules with id {}", id);

        workScheduleRepository.delete(workScheduleRepository.findById(id).orElseThrow(() -> new ResourceNotFoundException("Work Schedule Not Found")));

        return ApiResponse.builder()
                .status(HttpStatus.ACCEPTED.value())
                .message("Delete work schedules successfully")
                .build();
    }
}
