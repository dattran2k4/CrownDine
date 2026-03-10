package com.crowndine.dto.response;

import com.crowndine.common.enums.EAttendanceStatus;
import lombok.Builder;
import lombok.Getter;

import java.util.Arrays;
import java.util.List;
import java.util.stream.Collectors;

/**
 * Legend trạng thái chấm công cho FE (Đúng giờ, Đi muộn/Về sớm, Chấm công thiếu, Chưa chấm công, Nghỉ làm).
 */
@Builder
@Getter
public class TimekeepingStatusLegendResponse {
    private String code;
    private String labelVi;

    public static List<TimekeepingStatusLegendResponse> all() {
        return Arrays.stream(EAttendanceStatus.values())
                .map(s -> TimekeepingStatusLegendResponse.builder()
                        .code(s.name())
                        .labelVi(getLabelVi(s))
                        .build())
                .collect(Collectors.toList());
    }

    private static String getLabelVi(EAttendanceStatus s) {
        return switch (s) {
            case ON_TIME -> "Đúng giờ";
            case LATE_EARLY -> "Đi muộn / Về sớm";
            case MISSING_PUNCH -> "Chấm công thiếu";
            case NOT_PUNCHED -> "Chưa chấm công";
            case ABSENT_OFF -> "Nghỉ làm";
        };
    }
}
