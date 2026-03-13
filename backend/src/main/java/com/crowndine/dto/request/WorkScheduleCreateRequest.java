package com.crowndine.dto.request;

import com.fasterxml.jackson.annotation.JsonFormat;
import jakarta.validation.constraints.FutureOrPresent;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;

import java.time.DayOfWeek;
import java.time.LocalDate;
import java.util.List;

@Getter
public class WorkScheduleCreateRequest {

    @NotNull(message = "Ca làm vệc không được để trống")
    private Long shiftId;

    @NotNull(message = "Thời gian làm việc không được để trống")
    @JsonFormat(pattern = "dd-MM-yyyy")
    @FutureOrPresent(message = "Thời gian làm việc phải là hôm nay hoặc mai")
    private LocalDate workDate;

    @NotNull
    private List<Long> staffIds;

    private Boolean repeatWeekly;
    private List<Integer> daysOfWeek;

    @JsonFormat(pattern = "dd-MM-yyyy")
    @FutureOrPresent(message = "Ngày kết thúc phải là hôm nay hoặc tương lai")
    private LocalDate endDate;
}
