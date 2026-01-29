package com.crowndine.dto.response;

import com.crowndine.common.enums.EGender;
import com.crowndine.common.enums.EWorkScheduleStatus;
import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;

@Builder
@Setter
@Getter
public class WorkScheduleResponse {
    private Long id;
    private LocalDate workDate;
    private EWorkScheduleStatus status;
    private String note;
    private ShiftResponse shift;
    private UserInfo user;

    @Getter
    @Setter
    @Builder
    public static class UserInfo {
        private Long id;
        private String fullName;
        private EGender gender;
        private String avatarUrl;
    }
}
