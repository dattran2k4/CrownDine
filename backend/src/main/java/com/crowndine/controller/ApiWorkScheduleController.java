package com.crowndine.controller;

import com.crowndine.common.enums.EWorkScheduleStatus;
import com.crowndine.dto.response.ApiResponse;
import com.crowndine.repository.WorkScheduleRepository;
import com.crowndine.service.workschedule.WorkScheduleService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDate;

@RestController
@Validated
@RequiredArgsConstructor
@RequestMapping("/api/work-schedules")
@Slf4j(topic = "API-WORK-SCHEDULE-CONTROLLER")
public class ApiWorkScheduleController {

    private final WorkScheduleService workScheduleService;
    private final WorkScheduleRepository workScheduleRepository;

    @GetMapping
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
}
