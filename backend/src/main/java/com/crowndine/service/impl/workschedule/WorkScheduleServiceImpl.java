package com.crowndine.service.impl.workschedule;

import com.crowndine.common.enums.EWorkScheduleStatus;
import com.crowndine.dto.request.WorkScheduleCreateRequest;
import com.crowndine.dto.request.WorkScheduleUpdateRequest;
import com.crowndine.dto.response.ShiftResponse;
import com.crowndine.dto.response.WorkScheduleResponse;
import com.crowndine.exception.InvalidDataException;
import com.crowndine.exception.ResourceNotFoundException;
import com.crowndine.model.Shift;
import com.crowndine.model.User;
import com.crowndine.model.WorkSchedule;
import com.crowndine.repository.ShiftRepository;
import com.crowndine.repository.UserRepository;
import com.crowndine.repository.WorkScheduleRepository;
import com.crowndine.service.user.UserService;
import com.crowndine.service.workschedule.WorkScheduleService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j(topic = "WORK-SCHEDULE-SERVICE")
public class WorkScheduleServiceImpl implements WorkScheduleService {

    private final WorkScheduleRepository workScheduleRepository;
    private final ShiftRepository shiftRepository;
    private final UserRepository userRepository;
    private final UserService userService;

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

    @Override
    @Transactional(rollbackFor = Exception.class)
    public void changeWorkScheduleStatus(Long id, EWorkScheduleStatus status) {
        log.info("Processing approve work schedule id {}", id);
        WorkSchedule entity = workScheduleRepository.findById(id).orElseThrow(() -> new ResourceNotFoundException("Work Schedule Not Found"));

        if (entity.getWorkDate().isBefore(LocalDate.now()) && EWorkScheduleStatus.APPROVED.equals(status)) {
            throw new InvalidDataException("Không thể chấp nhận lịch quá khứ");
        }

        entity.setStatus(status);

        log.info("Status work schedule change to {}", status);

        workScheduleRepository.save(entity);
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public long createWorkSchedule(WorkScheduleCreateRequest request) {
        log.info("Proccessing to create work schedule in: {} ", request.getWorkDate());
        Shift shift = shiftRepository.findById(request.getShiftId()).orElseThrow(() -> new ResourceNotFoundException("Shift Not Found"));


        List<User> staffs = userRepository.findAllById(request.getStaffIds());

        if (staffs.size() != request.getStaffIds().size()) {
            throw new ResourceNotFoundException("Một số nhân viên không tồn tại trong hệ thống");
        }

        if (request.getWorkDate().isBefore(LocalDate.now())) {
            throw new InvalidDataException("Không thể xếp lịch cho ngày trong quá khứ");
        }

        List<WorkSchedule> existingSchedules = workScheduleRepository.findByStaffInAndShiftAndWorkDate(staffs, shift, request.getWorkDate());

        Set<Long> duplicateUserIds = existingSchedules.stream()
                .map(ws -> ws.getStaff().getId())
                .collect(Collectors.toSet());

        List<WorkSchedule> workSchedules = new ArrayList<>();

        for (User staff : staffs) {
            if (!duplicateUserIds.contains(staff.getId())) {
                WorkSchedule workSchedule = new WorkSchedule();
                workSchedule.setWorkDate(request.getWorkDate());
                workSchedule.setShift(shift);
                workSchedule.setStaff(staff);
                workSchedule.setStatus(EWorkScheduleStatus.APPROVED);
                workSchedules.add(workSchedule);
            } else {
                log.info("Duplicate work schedules for staffId {}", staff.getId());
            }
        }

        workScheduleRepository.saveAll(workSchedules);

        log.info("Create {} work schedule successfully", workSchedules.size());
        return workSchedules.size();
    }

    @Override
    public void updateWorkSchedule(WorkScheduleUpdateRequest request, Long id) {
        log.info("Processing to update work schedule");
        WorkSchedule workSchedule = workScheduleRepository.findById(id).orElseThrow(() -> new ResourceNotFoundException("Work Schedule Not Found"));

        Shift shift = shiftRepository.findById(request.getShiftId()).orElseThrow(() -> new ResourceNotFoundException("Shift Not Found"));

        User staff = userRepository.findById(request.getStaffId()).orElseThrow(() -> new ResourceNotFoundException("Staff Not Found"));

        workSchedule.setWorkDate(request.getWorkDate());
        workSchedule.setShift(shift);
        workSchedule.setStaff(staff);

        workScheduleRepository.save(workSchedule);
        log.info("Updated work schedule id {}", id);
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public void deleteWorkSchedule(Long id) {
        workScheduleRepository.delete(workScheduleRepository.findById(id).orElseThrow(() -> new ResourceNotFoundException("Work Schedule Not Found")));
        log.info("Delete work schedule id {} successfully", id);
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
                .avatarUrl(user.getAvatarUrl())
                .build();
    }
}
