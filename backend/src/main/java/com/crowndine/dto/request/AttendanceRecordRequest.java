package com.crowndine.dto.request;

import com.crowndine.common.enums.EAttendanceType;
import com.fasterxml.jackson.annotation.JsonFormat;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Getter
@Setter
public class AttendanceRecordRequest {

    @NotNull(message = "Nhân viên không được để trống")
    private Long userId;

    @NotNull(message = "Ngày không được để trống")
    @JsonFormat(pattern = "dd/MM/yyyy")
    private LocalDate workDate;

    @NotNull(message = "Ca làm việc không được để trống")
    private Long shiftId;

    private String note;

    @NotNull(message = "Hình thức không được để trống")
    private EAttendanceType attendanceType;

    private Boolean hasPunchIn = false;

    private Boolean hasPunchOut = false;

    @JsonFormat(pattern = "dd/MM/yyyy HH:mm")
    private LocalDateTime checkInAt;

    @JsonFormat(pattern = "dd/MM/yyyy HH:mm")
    private LocalDateTime checkOutAt;
}
