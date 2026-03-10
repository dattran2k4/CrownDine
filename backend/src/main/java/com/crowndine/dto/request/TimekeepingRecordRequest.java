package com.crowndine.dto.request;

import com.crowndine.common.enums.EAttendanceMethod;
import com.crowndine.common.enums.EAttendanceType;
import com.fasterxml.jackson.annotation.JsonFormat;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;
import java.time.LocalDateTime;

/**
 * Request cho form Chấm công: ngày, ca, ghi chú, hình thức (đi làm/nghỉ có phép/nghỉ không phép), giờ vào/ra.
 */
@Getter
@Setter
public class TimekeepingRecordRequest {

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

    /** Có chấm giờ vào (checkbox Vào) */
    private Boolean hasPunchIn = false;

    /** Có chấm giờ ra (checkbox Ra) */
    private Boolean hasPunchOut = false;

    @JsonFormat(pattern = "dd/MM/yyyy HH:mm")
    private LocalDateTime checkInAt;

    @JsonFormat(pattern = "dd/MM/yyyy HH:mm")
    private LocalDateTime checkOutAt;

    /** Hình thức chấm công: MANUAL, SYSTEM, FINGERPRINT. Mặc định MANUAL khi gửi từ form thủ công. */
    private EAttendanceMethod method = EAttendanceMethod.MANUAL;
}
