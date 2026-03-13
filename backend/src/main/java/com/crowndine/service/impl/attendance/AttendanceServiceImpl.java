package com.crowndine.service.impl.attendance;

import com.crowndine.common.enums.EAttendanceStatus;
import com.crowndine.common.enums.EAttendanceType;
import com.crowndine.common.enums.EWorkScheduleStatus;
import com.crowndine.dto.request.AttendanceRecordRequest;
import com.crowndine.dto.response.*;
import com.crowndine.exception.InvalidDataException;
import com.crowndine.exception.ResourceNotFoundException;
import com.crowndine.model.Attendance;
import com.crowndine.model.Shift;
import com.crowndine.model.User;
import com.crowndine.model.WorkSchedule;
import com.crowndine.repository.AttendanceRepository;
import com.crowndine.repository.ShiftRepository;
import com.crowndine.repository.UserRepository;
import com.crowndine.repository.WorkScheduleRepository;
import com.crowndine.service.attendance.AttendanceService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

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

    @Override
    @Transactional(rollbackFor = Exception.class)
    public void saveRecord(AttendanceRecordRequest request) {
        User user = userRepository.findById(request.getUserId())
                .orElseThrow(() -> new ResourceNotFoundException("Nhân viên không tồn tại"));
        Shift shift = shiftRepository.findById(request.getShiftId())
                .orElseThrow(() -> new ResourceNotFoundException("Ca làm việc không tồn tại"));

        WorkSchedule workSchedule = workScheduleRepository.findByStaffAndShiftAndWorkDate(user, shift, request.getWorkDate())
                .stream()
                .findFirst()
                .orElseThrow(() -> new InvalidDataException("Nhân viên không có lịch làm việc cho ca này trong ngày đã chọn"));

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

        List<WorkSchedule> schedules = workScheduleRepository.findNormalSchedules(weekStart, weekEnd, null, null, EWorkScheduleStatus.APPROVED);
        if (searchName != null && !searchName.isBlank()) {
            String q = searchName.trim().toLowerCase();
            schedules = schedules.stream()
                    .filter(ws -> ws.getStaff().getFullName().toLowerCase().contains(q) || ws.getStaff().getUsername().toLowerCase().contains(q))
                    .toList();
        }

        List<Long> workScheduleIds = schedules.stream().map(WorkSchedule::getId).toList();
        List<Attendance> attendances = attendanceRepository.findByWorkDateBetween(weekStart, weekEnd).stream()
                .filter(a -> workScheduleIds.contains(a.getWorkSchedule().getId()))
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
                List<AttendanceScheduleResponse.AttendanceScheduleEmployeeResponse> employees = schedules.stream()
                        .filter(ws -> ws.getShift().getId().equals(shift.getId()) && ws.getWorkDate().equals(workDate))
                        .map(ws -> {
                            Attendance att = attendanceByWorkScheduleId.get(ws.getId());
                            String status = att != null && att.getStatus() != null ? att.getStatus().name() : EAttendanceStatus.NOT_PUNCHED.name();
                            return AttendanceScheduleResponse.AttendanceScheduleEmployeeResponse.builder()
                                    .userId(ws.getStaff().getId())
                                    .staffCode(ws.getStaff().getUsername())
                                    .fullName(ws.getStaff().getFullName())
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

        List<WorkSchedule> schedules = workScheduleRepository.findNormalSchedules(weekStart, weekEnd, null, null, EWorkScheduleStatus.APPROVED);
        if (searchName != null && !searchName.isBlank()) {
            String q = searchName.trim().toLowerCase();
            schedules = schedules.stream()
                    .filter(ws -> ws.getStaff().getFullName().toLowerCase().contains(q) || ws.getStaff().getUsername().toLowerCase().contains(q))
                    .toList();
        }

        List<Attendance> attendances = attendanceRepository.findByWorkDateBetween(weekStart, weekEnd);
        Map<Long, Attendance> attByWsId = attendances.stream().collect(Collectors.toMap(a -> a.getWorkSchedule().getId(), a -> a));

        Set<Long> userIds = schedules.stream().map(ws -> ws.getStaff().getId()).collect(Collectors.toSet());
        Map<Long, User> userMap = userRepository.findAllById(userIds).stream().collect(Collectors.toMap(User::getId, u -> u));

        List<AttendanceSummaryResponse.EmployeeAttendanceSummaryResponse> list = new ArrayList<>();
        for (Long uid : userIds) {
            User user = userMap.get(uid);
            if (user == null) continue;
            List<WorkSchedule> userSchedules = schedules.stream().filter(ws -> ws.getStaff().getId().equals(uid)).toList();

            int workShiftCount = 0;
            double workMinutes = 0;
            int leaveShiftCount = 0;
            int lateCount = 0;
            long lateMinutes = 0;
            int earlyCount = 0;
            long earlyMinutes = 0;

            for (WorkSchedule ws : userSchedules) {
                Attendance att = attByWsId.get(ws.getId());
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
                if (att.getCheckInAt() != null && att.getCheckInAt().toLocalTime().isAfter(ws.getShift().getStartTime())) {
                    lateCount++;
                    lateMinutes += Duration.between(ws.getShift().getStartTime().atDate(att.getCheckInAt().toLocalDate()), att.getCheckInAt()).toMinutes();
                }
                if (att.getCheckOutAt() != null && att.getCheckOutAt().toLocalTime().isBefore(ws.getShift().getEndTime())) {
                    earlyCount++;
                    earlyMinutes += Duration.between(att.getCheckOutAt(), ws.getShift().getEndTime().atDate(att.getCheckOutAt().toLocalDate())).toMinutes();
                }
            }

            boolean noData = userSchedules.isEmpty();
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
