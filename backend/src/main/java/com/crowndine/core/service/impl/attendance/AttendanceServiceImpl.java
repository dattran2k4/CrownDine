package com.crowndine.core.service.impl.attendance;

import com.crowndine.common.enums.EAttendanceStatus;
import com.crowndine.common.enums.EAttendanceType;
import com.crowndine.common.enums.EWorkScheduleStatus;
import com.crowndine.presentation.dto.request.AttendanceRecordRequest;
import com.crowndine.presentation.dto.response.*;
import com.crowndine.presentation.exception.InvalidDataException;
import com.crowndine.presentation.exception.ResourceNotFoundException;
import com.crowndine.core.entity.Attendance;
import com.crowndine.core.entity.Shift;
import com.crowndine.core.entity.User;
import com.crowndine.core.entity.WorkSchedule;
import com.crowndine.core.repository.AttendanceRepository;
import com.crowndine.core.repository.ShiftRepository;
import com.crowndine.core.repository.UserRepository;
import com.crowndine.core.repository.WorkScheduleRepository;
import com.crowndine.core.service.attendance.AttendanceService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Duration;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.temporal.WeekFields;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j(topic = "ATTENDANCE-SERVICE")
public class AttendanceServiceImpl implements AttendanceService {

    private final AttendanceRepository attendanceRepository;
    private final WorkScheduleRepository workScheduleRepository;
    private final ShiftRepository shiftRepository;
    private final UserRepository userRepository;

    private static final List<String> THU = List.of("Thứ Hai", "Thứ Ba", "Thứ Tư", "Thứ Năm", "Thứ Sáu", "Thứ Bảy", "Chủ Nhật");

    /** Một ô lịch: nhân viên + ca + ngày. workScheduleId = null nếu là ca ảo (từ lịch lặp). */
    @Data
    @AllArgsConstructor
    @NoArgsConstructor
    private static class ScheduleSlot {
        private Long userId;
        private String staffCode;
        private String fullName;
        private Long shiftId;
        private LocalDate workDate;
        private Long workScheduleId;
    }

    /** Thu thập tất cả ô lịch trong tuần: ca bình thường + ca lặp đã mở rộng (giống màn Lịch làm việc). */
    private List<ScheduleSlot> collectScheduleSlots(LocalDate weekStart, LocalDate weekEnd, String searchName) {
        List<WorkSchedule> normal = workScheduleRepository.findNormalSchedules(weekStart, weekEnd, null, null, EWorkScheduleStatus.APPROVED);
        Set<String> normalKeys = new HashSet<>();
        List<ScheduleSlot> slots = new ArrayList<>();
        for (WorkSchedule ws : normal) {
            String key = ws.getStaff().getId() + "_" + ws.getShift().getId() + "_" + ws.getWorkDate();
            if (normalKeys.add(key)) {
                slots.add(new ScheduleSlot(
                        ws.getStaff().getId(), ws.getStaff().getUsername(), ws.getStaff().getFullName(),
                        ws.getShift().getId(), ws.getWorkDate(), ws.getId()));
            }
        }
        List<WorkSchedule> repeating = workScheduleRepository.findRepeatingSchedules(weekStart, weekEnd, null, null, EWorkScheduleStatus.APPROVED);
        for (WorkSchedule template : repeating) {
            LocalDate current = weekStart.isAfter(template.getWorkDate()) ? weekStart : template.getWorkDate();
            LocalDate end = template.getEndDate() != null && template.getEndDate().isBefore(weekEnd) ? template.getEndDate() : weekEnd;
            while (!current.isAfter(end)) {
                String dayStr = String.valueOf(current.getDayOfWeek().getValue());
                if (template.getDaysOfWeek() != null && template.getDaysOfWeek().contains(dayStr)) {
                    String key = template.getStaff().getId() + "_" + template.getShift().getId() + "_" + current;
                    if (normalKeys.add(key)) {
                        slots.add(new ScheduleSlot(
                                template.getStaff().getId(), template.getStaff().getUsername(), template.getStaff().getFullName(),
                                template.getShift().getId(), current, null));
                    }
                }
                current = current.plusDays(1);
            }
        }
        if (searchName != null && !searchName.isBlank()) {
            String q = searchName.trim().toLowerCase();
            slots = slots.stream()
                    .filter(s -> s.getFullName().toLowerCase().contains(q) || s.getStaffCode().toLowerCase().contains(q))
                    .toList();
        }
        return slots;
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public void saveRecord(AttendanceRecordRequest request) {
        User user = userRepository.findById(request.getUserId())
                .orElseThrow(() -> new ResourceNotFoundException("Nhân viên không tồn tại"));
        Shift shift = shiftRepository.findById(request.getShiftId())
                .orElseThrow(() -> new ResourceNotFoundException("Ca làm việc không tồn tại"));

        LocalDate workDate = request.getWorkDate();
        WorkSchedule workSchedule = workScheduleRepository.findByStaffAndShiftAndWorkDate(user, shift, workDate)
                .stream()
                .findFirst()
                .orElseGet(() -> createWorkScheduleFromRepeatingTemplate(user, shift, workDate));

        Optional<Attendance> existing = attendanceRepository.findByWorkScheduleId(workSchedule.getId());
        Attendance attendance = existing.orElse(new Attendance());
        attendance.setWorkSchedule(workSchedule);
        attendance.setUser(user);
        attendance.setNote(request.getNote());
        attendance.setAttendanceType(request.getAttendanceType());

        if (EAttendanceType.WORKING.equals(request.getAttendanceType())) {
            attendance.setCheckInAt(Boolean.TRUE.equals(request.getHasPunchIn()) ? request.getCheckInAt() : null);
            attendance.setCheckOutAt(Boolean.TRUE.equals(request.getHasPunchOut()) ? request.getCheckOutAt() : null);
            attendance.setStatus(computeStatus(workSchedule.getShift(), request));
        } else {
            attendance.setCheckInAt(null);
            attendance.setCheckOutAt(null);
            attendance.setStatus(EAttendanceStatus.ABSENT_OFF);
        }

        attendanceRepository.save(attendance);
        log.info("Saved attendance for user {} date {} shift {}", user.getUsername(), request.getWorkDate(), shift.getName());
    }

    /**
     * Nếu nhân viên có lịch lặp (repeating) trùng ca + ngày, tạo bản ghi work_schedule cho ngày đó
     * để có thể chấm công. Nếu không có template phù hợp thì throw.
     */
    private WorkSchedule createWorkScheduleFromRepeatingTemplate(User user, Shift shift, LocalDate workDate) {
        List<WorkSchedule> templates = workScheduleRepository.findRepeatingSchedules(
                workDate, workDate, user.getId(), shift.getId(), EWorkScheduleStatus.APPROVED);
        String dayOfWeekStr = String.valueOf(workDate.getDayOfWeek().getValue());
        WorkSchedule template = templates.stream()
                .filter(t -> !workDate.isBefore(t.getWorkDate())
                        && (t.getEndDate() == null || !workDate.isAfter(t.getEndDate()))
                        && t.getDaysOfWeek() != null && t.getDaysOfWeek().contains(dayOfWeekStr))
                .findFirst()
                .orElseThrow(() -> new InvalidDataException("Nhân viên không có lịch làm việc cho ca này trong ngày đã chọn"));

        WorkSchedule one = new WorkSchedule();
        one.setWorkDate(workDate);
        one.setStaff(user);
        one.setShift(shift);
        one.setStatus(EWorkScheduleStatus.APPROVED);
        one.setNote(template.getNote());
        one.setIsRepeated(false);
        one.setRepeatGroupId("FROM-" + template.getId());
        one.setEndDate(null);
        one.setDaysOfWeek(null);
        return workScheduleRepository.save(one);
    }

    private EAttendanceStatus computeStatus(Shift shift, AttendanceRecordRequest req) {
        boolean hasIn = Boolean.TRUE.equals(req.getHasPunchIn());
        boolean hasOut = Boolean.TRUE.equals(req.getHasPunchOut());
        if (!hasIn && !hasOut) return EAttendanceStatus.NOT_PUNCHED;
        if (hasIn != hasOut) return EAttendanceStatus.MISSING_PUNCH;

        LocalDateTime checkIn = req.getCheckInAt();
        LocalDateTime checkOut = req.getCheckOutAt();
        if (checkIn == null || checkOut == null) return EAttendanceStatus.MISSING_PUNCH;

        LocalTime in = checkIn.toLocalTime();
        LocalTime out = checkOut.toLocalTime();
        boolean late = in.isAfter(shift.getStartTime());
        boolean early = out.isBefore(shift.getEndTime());
        if (late || early) return EAttendanceStatus.LATE_EARLY;
        return EAttendanceStatus.ON_TIME;
    }

    @Override
    public Page<AttendanceHistoryItemResponse> getHistory(Long userId, Pageable pageable) {
        if (!userRepository.existsById(userId)) {
            throw new ResourceNotFoundException("Nhân viên không tồn tại");
        }
        return attendanceRepository.findByUserIdOrderByCreatedAtDesc(userId, pageable)
                .map(this::toHistoryItem);
    }

    private AttendanceHistoryItemResponse toHistoryItem(Attendance a) {
        LocalDateTime time = a.getCheckInAt() != null ? a.getCheckInAt() : a.getCreatedAt();
        return AttendanceHistoryItemResponse.builder()
                .id(a.getId())
                .time(time)
                .status(a.getStatus())
                .content(a.getNote())
                .build();
    }

    @Override
    public AttendanceScheduleResponse getWeeklySchedule(LocalDate date, String searchName) {
        LocalDate weekStart = date != null ? date.with(WeekFields.ISO.dayOfWeek(), 1) : LocalDate.now().with(WeekFields.ISO.dayOfWeek(), 1);
        LocalDate weekEnd = weekStart.plusDays(6);
        int weekNumber = weekStart.get(WeekFields.ISO.weekOfWeekBasedYear());
        int year = weekStart.getYear();

        List<ScheduleSlot> slots = collectScheduleSlots(weekStart, weekEnd, searchName);
        Set<Long> workScheduleIds = slots.stream().map(ScheduleSlot::getWorkScheduleId).filter(Objects::nonNull).collect(Collectors.toSet());
        List<Attendance> attendances = attendanceRepository.findByWorkDateBetween(weekStart, weekEnd).stream()
                .filter(a -> a.getWorkSchedule() != null && workScheduleIds.contains(a.getWorkSchedule().getId()))
                .toList();
        Map<Long, Attendance> attendanceByWorkScheduleId = attendances.stream().collect(Collectors.toMap(a -> a.getWorkSchedule().getId(), a -> a));

        List<ShiftResponse> shifts = shiftRepository.findAll().stream()
                .map(this::toShiftResponse)
                .sorted(Comparator.comparing(ShiftResponse::getStartTime))
                .toList();

        List<AttendanceScheduleResponse.AttendanceScheduleCellResponse> cells = new ArrayList<>();
        for (Shift shift : shiftRepository.findAll()) {
            for (LocalDate d = weekStart; !d.isAfter(weekEnd); d = d.plusDays(1)) {
                LocalDate workDate = d;
                List<AttendanceScheduleResponse.AttendanceScheduleEmployeeResponse> employees = slots.stream()
                        .filter(s -> s.getShiftId().equals(shift.getId()) && s.getWorkDate().equals(workDate))
                        .map(s -> {
                            Attendance att = s.getWorkScheduleId() != null ? attendanceByWorkScheduleId.get(s.getWorkScheduleId()) : null;
                            String status = att != null && att.getStatus() != null ? att.getStatus().name() : EAttendanceStatus.NOT_PUNCHED.name();
                            return AttendanceScheduleResponse.AttendanceScheduleEmployeeResponse.builder()
                                    .userId(s.getUserId())
                                    .staffCode(s.getStaffCode())
                                    .fullName(s.getFullName())
                                    .status(status)
                                    .build();
                        })
                        .toList();
                if (employees.isEmpty()) continue;

                int dayIndex = (int) java.time.temporal.ChronoUnit.DAYS.between(weekStart, d);
                String dayOfWeek = dayIndex < THU.size() ? THU.get(dayIndex) : d.getDayOfWeek().toString();
                cells.add(AttendanceScheduleResponse.AttendanceScheduleCellResponse.builder()
                        .shiftId(shift.getId())
                        .workDate(workDate)
                        .dayOfWeek(dayOfWeek)
                        .dateShort(workDate.getDayOfMonth() + "/" + workDate.getMonthValue())
                        .employees(employees)
                        .build());
            }
        }

        return AttendanceScheduleResponse.builder()
                .weekStart(weekStart)
                .weekEnd(weekEnd)
                .weekNumber(weekNumber)
                .year(year)
                .shifts(shifts)
                .cells(cells)
                .build();
    }

    @Override
    public AttendanceSummaryResponse getAttendanceSummary(LocalDate date, String searchName) {
        LocalDate weekStart = date != null ? date.with(WeekFields.ISO.dayOfWeek(), 1) : LocalDate.now().with(WeekFields.ISO.dayOfWeek(), 1);
        LocalDate weekEnd = weekStart.plusDays(6);

        List<ScheduleSlot> slots = collectScheduleSlots(weekStart, weekEnd, searchName);
        Set<Long> workScheduleIds = slots.stream().map(ScheduleSlot::getWorkScheduleId).filter(Objects::nonNull).collect(Collectors.toSet());
        List<Attendance> attendances = attendanceRepository.findByWorkDateBetween(weekStart, weekEnd).stream()
                .filter(a -> a.getWorkSchedule() != null && workScheduleIds.contains(a.getWorkSchedule().getId()))
                .toList();
        Map<Long, Attendance> attByWsId = attendances.stream().collect(Collectors.toMap(a -> a.getWorkSchedule().getId(), a -> a));

        Set<Long> userIds = slots.stream().map(ScheduleSlot::getUserId).collect(Collectors.toSet());
        Map<Long, User> userMap = userRepository.findAllById(userIds).stream().collect(Collectors.toMap(User::getId, u -> u));

        List<AttendanceSummaryResponse.EmployeeAttendanceSummaryResponse> list = new ArrayList<>();
        for (Long uid : userIds) {
            User user = userMap.get(uid);
            if (user == null) continue;
            List<ScheduleSlot> userSlots = slots.stream().filter(s -> s.getUserId().equals(uid)).toList();

            int workShiftCount = 0;
            double workMinutes = 0;
            int leaveShiftCount = 0;
            int lateCount = 0;
            long lateMinutes = 0;
            int earlyCount = 0;
            long earlyMinutes = 0;

            for (ScheduleSlot slot : userSlots) {
                if (slot.getWorkScheduleId() == null) {
                    leaveShiftCount++;
                    continue;
                }
                Attendance att = attByWsId.get(slot.getWorkScheduleId());
                if (att == null) {
                    leaveShiftCount++;
                    continue;
                }
                if (att.getStatus() == EAttendanceStatus.ABSENT_OFF || att.getAttendanceType() != EAttendanceType.WORKING) {
                    leaveShiftCount++;
                    continue;
                }
                workShiftCount++;
                if (att.getCheckInAt() != null && att.getCheckOutAt() != null) {
                    workMinutes += Duration.between(att.getCheckInAt(), att.getCheckOutAt()).toMinutes();
                }
                if (att.getWorkSchedule() != null && att.getWorkSchedule().getShift() != null) {
                    if (att.getCheckInAt() != null && att.getCheckInAt().toLocalTime().isAfter(att.getWorkSchedule().getShift().getStartTime())) {
                        lateCount++;
                        lateMinutes += Duration.between(att.getWorkSchedule().getShift().getStartTime().atDate(att.getCheckInAt().toLocalDate()), att.getCheckInAt()).toMinutes();
                    }
                    if (att.getCheckOutAt() != null && att.getCheckOutAt().toLocalTime().isBefore(att.getWorkSchedule().getShift().getEndTime())) {
                        earlyCount++;
                        earlyMinutes += Duration.between(att.getCheckOutAt(), att.getWorkSchedule().getShift().getEndTime().atDate(att.getCheckOutAt().toLocalDate())).toMinutes();
                    }
                }
            }

            boolean noData = userSlots.isEmpty();
            list.add(AttendanceSummaryResponse.EmployeeAttendanceSummaryResponse.builder()
                    .userId(uid)
                    .staffCode(user.getUsername())
                    .fullName(user.getFullName())
                    .workShiftCount(workShiftCount)
                    .workHoursTotal(noData ? "" : formatHours(workMinutes))
                    .leaveShiftCount(leaveShiftCount)
                    .lateCount(lateCount)
                    .lateDuration(formatDuration(lateMinutes))
                    .earlyLeaveCount(earlyCount)
                    .earlyLeaveDuration(formatDuration(earlyMinutes))
                    .overtime("")
                    .noData(noData)
                    .build());
        }

        list.sort(Comparator.comparing(AttendanceSummaryResponse.EmployeeAttendanceSummaryResponse::getStaffCode));
        int weekNum = weekStart.get(WeekFields.ISO.weekOfWeekBasedYear());
        String periodLabel = "Tuần " + weekNum + " - Th. " + String.format("%02d", weekStart.getMonthValue()) + " " + weekStart.getYear();

        return AttendanceSummaryResponse.builder()
                .periodLabel(periodLabel)
                .employees(list)
                .build();
    }

    @Override
    public EmployeeAttendanceInfoResponse getEmployeeAttendanceInfo(Long userId) {
        User user = userRepository.findById(userId).orElseThrow(() -> new ResourceNotFoundException("Nhân viên không tồn tại"));
        LocalDate today = LocalDate.now();
        List<Attendance> todayAttendances = attendanceRepository.findByUserIdAndWorkDateBetween(userId, today, today);
        EAttendanceStatus currentStatus = EAttendanceStatus.NOT_PUNCHED;
        if (!todayAttendances.isEmpty()) {
            currentStatus = todayAttendances.get(0).getStatus() != null ? todayAttendances.get(0).getStatus() : EAttendanceStatus.NOT_PUNCHED;
        }
        return EmployeeAttendanceInfoResponse.builder()
                .userId(user.getId())
                .staffCode(user.getUsername())
                .fullName(user.getFullName())
                .currentStatus(currentStatus)
                .build();
    }

    private ShiftResponse toShiftResponse(Shift s) {
        return ShiftResponse.builder()
                .id(s.getId())
                .name(s.getName())
                .startTime(s.getStartTime())
                .endTime(s.getEndTime())
                .build();
    }

    private static String formatHours(double minutes) {
        double h = minutes / 60;
        if (h == (long) h) return (long) h + " giờ";
        return String.format(Locale.US, "%.1f giờ", h).replace(".0", "");
    }

    private static String formatDuration(long minutes) {
        if (minutes <= 0) return "";
        long h = minutes / 60;
        long m = minutes % 60;
        if (h > 0 && m > 0) return h + "h " + m + "p";
        if (h > 0) return h + "h 0p";
        return "0h " + m + "p";
    }
}
