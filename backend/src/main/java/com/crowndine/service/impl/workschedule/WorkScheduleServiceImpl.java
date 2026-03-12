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
    public List<WorkScheduleResponse> getWorkSchedules(LocalDate fromDate, LocalDate toDate, LocalDate date,
            EWorkScheduleStatus status, Long userId, Long shiftId) {
        if (date != null) {
            fromDate = date;
            toDate = date;
        }

        if (fromDate == null)
            fromDate = LocalDate.now().minusYears(1);
        if (toDate == null)
            toDate = LocalDate.now().plusYears(1);

        List<WorkSchedule> entity = workScheduleRepository.findNormalSchedules(fromDate, toDate, userId, shiftId,
                status);

        List<WorkScheduleResponse> physicalResponses = entity.stream()
                .filter(ws -> ws.getStatus() != EWorkScheduleStatus.CANCELLED)
                .map(workSchedule -> WorkScheduleResponse.builder()
                        .id(workSchedule.getId())
                        .workDate(workSchedule.getWorkDate())
                        .status(workSchedule.getStatus())
                        .note(workSchedule.getNote())
                        .repeatGroupId(workSchedule.getRepeatGroupId())
                        .shift(toShiftResponse(workSchedule.getShift()))
                        .user(toUserInfo(workSchedule.getStaff()))
                        .build())
                .collect(Collectors.toList());

        List<WorkSchedule> templates = workScheduleRepository.findRepeatingSchedules(fromDate, toDate,
                userId, shiftId, status);

        Set<String> physicalLookup = entity.stream()
                .map(ws -> ws.getStaff().getId() + "_" + ws.getShift().getId() + "_" + ws.getWorkDate().toString())
                .collect(Collectors.toSet());

        List<WorkScheduleResponse> virtualResponses = new ArrayList<>();

        for (WorkSchedule template : templates) { // Note: template is now a WorkSchedule entity
            LocalDate currentDate = fromDate.isAfter(template.getWorkDate()) ? fromDate : template.getWorkDate();
            // endDate might be null for older items, fallback to current toDate if needed,
            // but it should be populated now
            LocalDate actualEndDate = template.getEndDate() != null ? template.getEndDate() : toDate;
            LocalDate end = toDate.isBefore(actualEndDate) ? toDate : actualEndDate;

            while (!currentDate.isAfter(end)) {
                String dayOfWeekStr = String.valueOf(currentDate.getDayOfWeek().getValue());

                if (template.getDaysOfWeek() != null && template.getDaysOfWeek().contains(dayOfWeekStr)) {
                    String lookupKey = template.getStaff().getId() + "_" + template.getShift().getId() + "_"
                            + currentDate.toString();
                    if (!physicalLookup.contains(lookupKey)) {
                        virtualResponses.add(WorkScheduleResponse.builder()
                                .id(-template.getId()) // ID âm để FE biết đây là ca ảo
                                .workDate(currentDate)
                                .status(template.getStatus())
                                .note(template.getNote())
                                .repeatGroupId("TEMPLATE-" + template.getId())
                                .shift(toShiftResponse(template.getShift()))
                                .user(toUserInfo(template.getStaff()))
                                .build());
                    }
                }
                currentDate = currentDate.plusDays(1);
            }
        }

        List<WorkScheduleResponse> combined = new ArrayList<>(physicalResponses);
        combined.addAll(virtualResponses);

        return combined;
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public void changeWorkScheduleStatus(Long id, EWorkScheduleStatus status) {
        log.info("Processing approve work schedule id {}", id);
        WorkSchedule entity = getWorkSchedule(id);

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
        // 1. Kiểm tra ngày hợp lệ (Guard Clause)
        validateWorkDate(request.getWorkDate()); //

        // 2. Lấy dữ liệu thực thể
        Shift shift = shiftRepository.findById(request.getShiftId())
                .orElseThrow(() -> new ResourceNotFoundException("Shift Not Found")); //
        List<User> staffs = fetchAndValidateStaffs(request.getStaffIds()); //

        // 3. Phân luồng xử lý chính
        if (shouldCreateTemplates(request)) {
            return handleCreateTemplates(request, staffs, shift); //
        }
        return handleCreateSingleSchedules(request, staffs, shift); //
    }

    // --- Các phương thức hỗ trợ (Private Methods) ---

    private void validateWorkDate(LocalDate date) {
        if (date.isBefore(LocalDate.now())) {
            throw new InvalidDataException("Không thể xếp lịch cho ngày trong quá khứ"); //
        }
    }

    private List<User> fetchAndValidateStaffs(List<Long> staffIds) {
        List<User> staffs = userRepository.findAllById(staffIds);
        if (staffs.size() != staffIds.size()) {
            throw new ResourceNotFoundException("Một số nhân viên không tồn tại trong hệ thống"); //
        }
        return staffs;
    }

    private boolean shouldCreateTemplates(WorkScheduleCreateRequest request) {
        return Boolean.TRUE.equals(request.getRepeatWeekly())
                && request.getDaysOfWeek() != null
                && !request.getDaysOfWeek().isEmpty(); //
    }

    private long handleCreateTemplates(WorkScheduleCreateRequest request, List<User> staffs, Shift shift) {
        LocalDate endDate = request.getEndDate() != null ? request.getEndDate()
                : request.getWorkDate().plusMonths(2); //

        if (endDate.isBefore(request.getWorkDate())) {
            throw new InvalidDataException("Ngày kết thúc không được trước ngày bắt đầu"); //
        }

        String daysOfWeekStr = request.getDaysOfWeek().stream()
                .map(String::valueOf).collect(Collectors.joining(",")); //

        List<WorkSchedule> templates = staffs.stream().map(staff -> {
            WorkSchedule t = new WorkSchedule();
            t.setStaff(staff);
            t.setShift(shift);
            t.setWorkDate(request.getWorkDate());
            t.setEndDate(endDate);
            t.setDaysOfWeek(daysOfWeekStr);
            t.setStatus(EWorkScheduleStatus.APPROVED);
            t.setIsRepeated(true);
            return t;
        }).toList(); //

        List<WorkSchedule> savedTemplates = workScheduleRepository.saveAll(templates);
        // Sau khi lưu, gán repeatGroupId = ID của chính nó để việc quản lý group dễ
        // dàng hơn.
        savedTemplates.forEach(t -> t.setRepeatGroupId("TEMPLATE-" + t.getId()));
        workScheduleRepository.saveAll(savedTemplates);

        log.info("Create {} work schedule templates successfully", savedTemplates.size());
        return savedTemplates.size();
    }

    private long handleCreateSingleSchedules(WorkScheduleCreateRequest request, List<User> staffs, Shift shift) {
        LocalDate date = request.getWorkDate();

        // Tối ưu hóa việc tìm trùng lặp bằng Set để tra cứu O(1)
        Set<Long> duplicateUserIds = workScheduleRepository.findByStaffInAndShiftAndWorkDate(staffs, shift, date)
                .stream().map(ws -> ws.getStaff().getId()).collect(Collectors.toSet()); //

        List<WorkSchedule> workSchedules = staffs.stream()
                .filter(staff -> !duplicateUserIds.contains(staff.getId())) //
                .map(staff -> {
                    WorkSchedule ws = new WorkSchedule();
                    ws.setWorkDate(date);
                    ws.setShift(shift);
                    ws.setStaff(staff);
                    ws.setStatus(EWorkScheduleStatus.APPROVED);
                    return ws;
                }).toList(); //

        return workScheduleRepository.saveAll(workSchedules).size();
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public void reassignWorkSchedules(WorkScheduleUpdateRequest request, Long id) {
        log.info("Processing to update work schedule");

        Shift shift = shiftRepository.findById(request.getShiftId())
                .orElseThrow(() -> new ResourceNotFoundException("Shift Not Found"));

        User staff = userRepository.findById(request.getStaffId())
                .orElseThrow(() -> new ResourceNotFoundException("Staff Not Found"));

        if (id < 0) {
            // Đây là ca ảo. Sửa ca ảo -> Tạo mới 1 bản ghi đè lên ngày đó cho người mới
            Long templateId = -id;
            WorkSchedule rootSchedule = workScheduleRepository.findById(templateId)
                    .orElseThrow(() -> new ResourceNotFoundException("Root Work Schedule Not Found"));

            // Check request.staff existed in this shift and date
            if (workScheduleRepository.existsByStaffAndShiftAndWorkDateAndIdNot(staff, shift, request.getWorkDate(),
                    -1L)) {
                throw new InvalidDataException("Nhân viên đã được xếp lịch cho ca này");
            }

            WorkSchedule exceptionSchedule = workScheduleRepository
                    .findNormalSchedules(request.getWorkDate(), request.getWorkDate(), rootSchedule.getStaff().getId(),
                            shift.getId(), null)
                    .stream()
                    .filter(ws -> ws.getRepeatGroupId() != null
                            && ws.getRepeatGroupId().equals(rootSchedule.getRepeatGroupId()))
                    .findFirst()
                    .orElseGet(WorkSchedule::new);

            exceptionSchedule.setWorkDate(request.getWorkDate());
            exceptionSchedule.setShift(shift);
            exceptionSchedule.setStaff(staff);
            exceptionSchedule.setRepeatGroupId(rootSchedule.getRepeatGroupId());
            exceptionSchedule.setIsRepeated(false);
            exceptionSchedule.setStatus(EWorkScheduleStatus.APPROVED);
            exceptionSchedule.setNote("Đã chuyển ca từ chuỗi gốc");

            workScheduleRepository.save(exceptionSchedule);
            log.info("Created or updated transferred exception for virtual schedule {} on {}", templateId,
                    request.getWorkDate());
            return;
        }

        WorkSchedule workSchedule = getWorkSchedule(id);

        // Check request.staff existed in this shift and date
        if (workScheduleRepository.existsByStaffAndShiftAndWorkDateAndIdNot(staff, shift, request.getWorkDate(), id)) {
            throw new InvalidDataException("Nhân viên đã được xếp lịch cho ca này");
        }

        // TODO Nếu đổi sang nhân viên KHÁC, cần kiểm tra xem lịch cũ đã có chấm công
        // chưa?

        workSchedule.setWorkDate(request.getWorkDate());
        workSchedule.setShift(shift);
        workSchedule.setStaff(staff);
        workSchedule.setStatus(EWorkScheduleStatus.APPROVED);

        workScheduleRepository.save(workSchedule);
        log.info("Updated work schedule id {}", id);
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public void deleteWorkSchedule(Long id, Boolean deletePattern, LocalDate workDate) {
        if (id < 0) {
            // Ca ảo, ID âm là đối chiếu ngược của template ID.
            Long templateId = -id;
            WorkSchedule rootSchedule = workScheduleRepository.findById(templateId)
                    .orElseThrow(() -> new ResourceNotFoundException("Root Work Schedule Not Found"));
            if (Boolean.TRUE.equals(deletePattern)) {
                // Xóa toàn bộ gốc rễ
                workScheduleRepository.delete(rootSchedule);
                log.info("Delete root virtual schedule id {} successfully", templateId);
            } else {
                // Xóa 1 ca ảo cụ thể -> Tạo 1 bản ghi Exception (CANCELLED)
                if (workDate == null) {
                    throw new InvalidDataException("Vui lòng cung cấp ngày làm việc để xóa ca ngoại lệ này.");
                }

                WorkSchedule exceptionSchedule = workScheduleRepository
                        .findNormalSchedules(workDate, workDate, rootSchedule.getStaff().getId(),
                                rootSchedule.getShift().getId(), null)
                        .stream()
                        .filter(ws -> ws.getRepeatGroupId() != null
                                && ws.getRepeatGroupId().equals(rootSchedule.getRepeatGroupId()))
                        .findFirst()
                        .orElseGet(WorkSchedule::new);

                exceptionSchedule.setWorkDate(workDate);
                exceptionSchedule.setShift(rootSchedule.getShift());
                exceptionSchedule.setStaff(rootSchedule.getStaff());
                exceptionSchedule.setRepeatGroupId(rootSchedule.getRepeatGroupId());
                exceptionSchedule.setIsRepeated(false);
                exceptionSchedule.setStatus(EWorkScheduleStatus.CANCELLED);
                exceptionSchedule.setNote("Đã xóa ngoại lệ từ chuỗi gốc");

                workScheduleRepository.save(exceptionSchedule);
                log.info("Created or updated CANCELLED exception for virtual schedule {} on {}", templateId, workDate);
            }
            return;
        }

        WorkSchedule schedule = workScheduleRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Work Schedule Not Found"));

        if (Boolean.TRUE.equals(deletePattern) && schedule.getRepeatGroupId() != null
                && schedule.getRepeatGroupId().startsWith("TEMPLATE-")) {
            try {
                Long templateId = Long.parseLong(schedule.getRepeatGroupId().replace("TEMPLATE-", ""));
                workScheduleRepository.deleteById(templateId);
                log.info("Delete root work schedule id {} associated with repeat group {} successfully", templateId,
                        schedule.getRepeatGroupId());
            } catch (NumberFormatException e) {
                log.warn("Could not parse template ID from repeat group: " + schedule.getRepeatGroupId());
            }
        }

        workScheduleRepository.delete(schedule);
        log.info("Delete work schedule id {} successfully", id);
    }

    @Override
    public WorkSchedule getWorkSchedule(Long id) {
        return workScheduleRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Work Schedule Not Found"));
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
