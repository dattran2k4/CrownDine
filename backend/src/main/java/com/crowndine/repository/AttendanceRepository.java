package com.crowndine.repository;

import com.crowndine.model.Attendance;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface AttendanceRepository extends JpaRepository<Attendance, Long> {

    Optional<Attendance> findByWorkScheduleId(Long workScheduleId);

    Page<Attendance> findByUserIdOrderByCreatedAtDesc(Long userId, Pageable pageable);

    @Query("SELECT a FROM Attendance a JOIN a.workSchedule ws WHERE a.user.id = :userId AND ws.workDate BETWEEN :fromDate AND :toDate ORDER BY ws.workDate DESC, a.createdAt DESC")
    List<Attendance> findByUserIdAndWorkDateBetween(@Param("userId") Long userId, @Param("fromDate") LocalDate fromDate, @Param("toDate") LocalDate toDate);

    @Query("SELECT a FROM Attendance a JOIN a.workSchedule ws WHERE ws.workDate BETWEEN :fromDate AND :toDate ORDER BY ws.workDate ASC, ws.shift.startTime ASC")
    List<Attendance> findByWorkDateBetween(@Param("fromDate") LocalDate fromDate, @Param("toDate") LocalDate toDate);
}
