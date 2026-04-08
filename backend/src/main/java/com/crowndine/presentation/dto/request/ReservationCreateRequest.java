package com.crowndine.presentation.dto.request;

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

    @NotNull(message = "{validation.reservation.date.not_null}")
    @JsonFormat(pattern = "yyyy-MM-dd")
    @FutureOrPresent
    private LocalDate date;

    @NotNull(message = "{validation.reservation.start_time.not_null}")
    @JsonFormat(pattern = "HH:mm")
    private LocalTime startTime;

    @NotNull(message = "{validation.reservation.guest_number.not_null}")
    @Min(value = 1, message = "{validation.reservation.guest_number.min}")
    private Integer guestNumber;

    @NotNull(message = "{validation.reservation.table_id.not_null}")
    @Min(value = 1, message = "{validation.reservation.table_id.min}")
    private Long tableId;

    @Size(max = 255, message = "{validation.reservation.note.size}")
    private String note;

}
