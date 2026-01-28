package com.crowndine.service.impl.workschedule;

import com.crowndine.common.enums.EWorkScheduleStatus;
import com.crowndine.dto.response.ShiftResponse;
import com.crowndine.dto.response.WorkScheduleResponse;
import com.crowndine.model.Shift;
import com.crowndine.model.User;
import com.crowndine.model.WorkSchedule;
import com.crowndine.repository.WorkScheduleRepository;
import com.crowndine.service.workschedule.WorkScheduleService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j(topic = "WORK-SCHEDULE-SERVICE")
public class WorkScheduleServiceImpl implements WorkScheduleService {

    private final WorkScheduleRepository workScheduleRepository;

    @Override
    public List<WorkScheduleResponse> getWorkSchedules(LocalDate fromDate, LocalDate toDate, LocalDate date, EWorkScheduleStatus status, Long userId, Long shiftId) {
        if (date != null) {
            fromDate = date;
            toDate = date;
        }

        List<WorkSchedule> entity = workScheduleRepository.findSchedules(fromDate, toDate, userId, shiftId, status);

        return entity.stream().map(workSchedule -> WorkScheduleResponse.builder()
                .id(workSchedule.getId())
                .workDate(workSchedule.getWorkDate())
                .status(workSchedule.getStatus())
                .note(workSchedule.getNote())
                .shift(toShiftResponse(workSchedule.getShift()))
                .user(toUserInfo(workSchedule.getStaff()))
                .build()).toList();
    }

    private ShiftResponse toShiftResponse(Shift shift) {
        return ShiftResponse.builder()
                .id(shift.getId())
                .name(shift.getName())
                .startTime(shift.getStartTime())
                .endTime(shift.getEndTime())
                .build();
    }

    private WorkScheduleResponse.UserInfo toUserInfo(User user) {
        return WorkScheduleResponse.UserInfo.builder()
                .id(user.getId())
                .fullName(user.getFullName())
                .gender(user.getGender())
                .build();
    }
}
