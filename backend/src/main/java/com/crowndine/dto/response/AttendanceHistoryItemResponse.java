package com.crowndine.dto.response;

import com.crowndine.common.enums.EAttendanceStatus;
import com.fasterxml.jackson.annotation.JsonFormat;
import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;

@Builder
@Getter
public class AttendanceHistoryItemResponse {
    private Long id;
    @JsonFormat(pattern = "dd/MM/yyyy HH:mm")
    private LocalDateTime time;
    private EAttendanceStatus status;
    private String content;
}
