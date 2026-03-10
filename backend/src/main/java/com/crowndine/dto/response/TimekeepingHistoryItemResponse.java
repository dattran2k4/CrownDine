package com.crowndine.dto.response;

import com.crowndine.common.enums.EAttendanceMethod;
import com.crowndine.common.enums.EAttendanceStatus;
import com.fasterxml.jackson.annotation.JsonFormat;
import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;

@Builder
@Getter
public class TimekeepingHistoryItemResponse {
    private Long id;
    @JsonFormat(pattern = "dd/MM/yyyy HH:mm")
    private LocalDateTime time;
    private EAttendanceStatus status;
    private String statusLabel;
    private EAttendanceMethod method;
    private String methodLabel;
    private String content; // note or summary
}
