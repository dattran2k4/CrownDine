package com.crowndine.common.enums;

/**
 * Trạng thái chấm công (legend: Đúng giờ, Đi muộn/Về sớm, Chấm công thiếu, Chưa chấm công, Nghỉ làm).
 */
public enum EAttendanceStatus {
    ON_TIME,           // Đúng giờ
    LATE_EARLY,        // Đi muộn / Về sớm
    MISSING_PUNCH,     // Chấm công thiếu
    NOT_PUNCHED,       // Chưa chấm công
    ABSENT_OFF         // Nghỉ làm
}
