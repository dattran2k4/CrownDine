package com.crowndine.dto.request;

import com.fasterxml.jackson.annotation.JsonFormat;
import jakarta.validation.constraints.FutureOrPresent;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Getter;

import java.time.LocalDate;
import java.time.LocalTime;

@Getter
public class ReservationCreateRequest {

    @NotNull(message = "Ngày đặt bàn không được để trống")
    @JsonFormat(pattern = "yyyy-MM-dd")
    @FutureOrPresent
    private LocalDate date;

    @NotNull(message = "Giờ bắt đầu không được để trống")
    @JsonFormat(pattern = "HH:mm")
    private LocalTime startTime;

    @NotNull(message = "Số lượng khách không được để trống")
    @Min(value = 1, message = "Số lượng khách phải >= 1")
    private Integer guestNumber;

    @NotNull(message = "Bàn không được để trống")
    @Min(value = 1, message = "Bàn không hợp lệ")
    private Long tableId;

    @Size(max = 255, message = "Ghi chú không được vượt quá 255 ký tự")
    private String note;

}
