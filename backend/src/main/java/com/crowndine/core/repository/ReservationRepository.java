package com.crowndine.core.repository;

import com.crowndine.common.enums.EOrderStatus;
import com.crowndine.common.enums.EReservationStatus;
import com.crowndine.common.enums.ETableStatus;
import com.crowndine.core.entity.Reservation;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface ReservationRepository extends JpaRepository<Reservation, Long> {
    Page<Reservation> findByUser_Id(Long userId, Pageable pageable);

    List<Reservation> findAllByUser_Id(Long userId);

    @Query("""
            select r
            from Reservation r
            where r.table is not null
              and r.date = :date
              and r.table.id in :tableIds
              and r.status in :statuses
              and r.checkedOutAt is null
              and (r.status <> 'PENDING' or (r.expiratedAt is not null and r.expiratedAt > :now))
            """)
    List<Reservation> findBlockingReservations(
            LocalDate date,
            List<Long> tableIds,
            List<EReservationStatus> statuses,
            LocalDateTime now
    );

    List<Reservation> findByStatusAndExpiratedAtBefore(EReservationStatus status, LocalDateTime now);

    @Query("""
            select r from Reservation r
            where r.status = :status
            and r.reminderSentAt is null
            and r.checkedOutAt is null
            and r.date = :date
            """)
    List<Reservation> findReminderCandidates(EReservationStatus status, LocalDate date);

    @Query("""
            select r
            from Reservation r
            join fetch r.table t
            join fetch r.order o
            where r.status = :reservationStatus
              and o.status = :orderStatus
              and t.status = :tableStatus
              and r.checkedOutAt is null
              and r.date = :date
              and r.startTime >= :fromTime
              and r.startTime < :toTime
            """)
    List<Reservation> findTableReserveCandidates(
            @Param("reservationStatus") EReservationStatus reservationStatus,
            @Param("orderStatus") EOrderStatus orderStatus,
            @Param("tableStatus") ETableStatus tableStatus,
            @Param("date") LocalDate date,
            @Param("fromTime") LocalTime fromTime,
            @Param("toTime") LocalTime toTime
    );

    Optional<Reservation> findByCode(String code);

    @Query("SELECT r FROM Reservation r WHERE " +
            "(:fromDate IS NULL OR r.date >= :fromDate) AND " +
            "(:toDate IS NULL OR r.date <= :toDate) AND " +
            "(:status IS NULL OR r.status = :status)")
    Page<Reservation> findReservations(
            @Param("fromDate") LocalDate fromDate,
            @Param("toDate") LocalDate toDate,
            @Param("status") EReservationStatus status,
            Pageable pageable);
}
