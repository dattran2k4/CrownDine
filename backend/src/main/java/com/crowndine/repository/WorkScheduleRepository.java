package com.crowndine.repository;

import com.crowndine.common.enums.EWorkScheduleStatus;
import com.crowndine.model.Shift;
import com.crowndine.model.User;
import com.crowndine.model.WorkSchedule;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface WorkScheduleRepository extends JpaRepository<WorkSchedule, Long> {

    @Query("""
                SELECT ws FROM WorkSchedule ws
                WHERE (:fromDate IS NULL OR :toDate IS NULL
                      OR ws.workDate BETWEEN :fromDate AND :toDate)
                AND (:userId IS NULL OR ws.staff.id = :userId)
                AND (:shiftId IS NULL OR ws.shift.id = :shiftId)
                AND (:status IS NULL OR ws.status = :status)
                ORDER BY ws.workDate ASC, ws.shift.startTime ASC
            """)
    List<WorkSchedule> findSchedules(
            @Param("fromDate") LocalDate fromDate,
            @Param("toDate") LocalDate toDate,
            @Param("userId") Long userId,
            @Param("shiftId") Long shiftId,
            @Param("status") EWorkScheduleStatus status
    );


    List<WorkSchedule> findByStaffInAndShiftAndWorkDate(List<User> staffs, Shift shift, LocalDate workDate);

    List<WorkSchedule> findByStaffAndShiftAndWorkDate(User staff, Shift shift, LocalDate workDate);

    boolean existsByStaffAndShiftAndWorkDateAndIdNot(User staff, Shift shift, LocalDate workDate, Long id);
}
