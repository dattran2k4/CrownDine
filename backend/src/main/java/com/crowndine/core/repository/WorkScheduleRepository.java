package com.crowndine.core.repository;

import com.crowndine.common.enums.EWorkScheduleStatus;
import com.crowndine.core.entity.Shift;
import com.crowndine.core.entity.User;
import com.crowndine.core.entity.WorkSchedule;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface WorkScheduleRepository extends JpaRepository<WorkSchedule, Long> {

    // Lấy các ca bình thường (không lặp)
    @Query("""
                SELECT ws FROM WorkSchedule ws
                WHERE (:fromDate IS NULL OR :toDate IS NULL
                      OR ws.workDate BETWEEN :fromDate AND :toDate)
                AND (ws.isRepeated = false OR ws.isRepeated IS NULL)
                AND (:userId IS NULL OR ws.staff.id = :userId)
                AND (:shiftId IS NULL OR ws.shift.id = :shiftId)
                AND (:status IS NULL OR ws.status = :status)
                ORDER BY ws.workDate ASC, ws.shift.startTime ASC
            """)
    List<WorkSchedule> findNormalSchedules(
            @Param("fromDate") LocalDate fromDate,
            @Param("toDate") LocalDate toDate,
            @Param("userId") Long userId,
            @Param("shiftId") Long shiftId,
            @Param("status") EWorkScheduleStatus status);

    // Lấy các ca có đánh dấu lặp lại (Template / mảng gốc) giao lặp với khoảng truy
    // vấn
    @Query("""
                SELECT ws FROM WorkSchedule ws
                WHERE ws.isRepeated = true
                AND (:fromDate IS NULL OR ws.endDate >= :fromDate)
                AND (:toDate IS NULL OR ws.workDate <= :toDate)
                AND (:userId IS NULL OR ws.staff.id = :userId)
                AND (:shiftId IS NULL OR ws.shift.id = :shiftId)
                AND (:status IS NULL OR ws.status = :status)
                ORDER BY ws.workDate ASC, ws.shift.startTime ASC
            """)
    List<WorkSchedule> findRepeatingSchedules(
            @Param("fromDate") LocalDate fromDate,
            @Param("toDate") LocalDate toDate,
            @Param("userId") Long userId,
            @Param("shiftId") Long shiftId,
            @Param("status") EWorkScheduleStatus status);

    List<WorkSchedule> findByStaffInAndShiftAndWorkDate(List<User> staffs, Shift shift, LocalDate workDate);

    List<WorkSchedule> findByStaffAndShiftAndWorkDate(User staff, Shift shift, LocalDate workDate);

    boolean existsByStaffAndShiftAndWorkDateAndIdNot(User staff, Shift shift, LocalDate workDate, Long id);
}
