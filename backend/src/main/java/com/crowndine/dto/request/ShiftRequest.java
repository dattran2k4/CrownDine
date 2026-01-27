package com.crowndine.dto.request;

import com.fasterxml.jackson.annotation.JsonFormat;
import jakarta.validation.constraints.*;
import lombok.*;

import java.time.LocalTime;

@Getter
@Setter
public class ShiftRequest {
    private Long id;

    @NotBlank(message = "Tên ca không được để trống")
    private String name;

    @NotNull(message = "Giờ bắt đầu không được để trống")
    @JsonFormat(pattern = "HH:mm")
    private LocalTime startTime;

    @NotNull(message = "Giờ kết thúc không được để trống")
    @JsonFormat(pattern = "HH:mm")
    private LocalTime endTime;
}
