package com.crowndine.repository;

import com.crowndine.common.enums.EReservationStatus;
import com.crowndine.model.Reservation;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface ReservationRepository extends JpaRepository<Reservation, Long> {
    Page<Reservation> findByCustomer_Id(Long customerId, Pageable pageable);

    @Query("""
            select r.table.id
            from Reservation r
            where r.table is not null
              and r.date = :date
              and r.status in :statuses
              and r.startTime < :endTime
              and r.endTime > :startTime
              and (r.status <> 'PENDING' or (r.expiratedAt is not null and r.expiratedAt > :now))
            """)
    List<Long> findReservedTableIds(
            LocalDate date,
            LocalTime startTime,
            LocalTime endTime,
            List<EReservationStatus> statuses,
            LocalDateTime now
    );

    List<Reservation> findByStatusAndExpiratedAtBefore(EReservationStatus status, LocalDateTime now);

    Optional<Reservation> findByCode(String code);

    @Query("SELECT r FROM Reservation r WHERE " +
           "(:fromDate IS NULL OR r.date >= :fromDate) AND " +
           "(:toDate IS NULL OR r.date <= :toDate) AND " +
           "(:status IS NULL OR r.status = :status)")
    Page<Reservation> findReservations(
            @org.springframework.data.repository.query.Param("fromDate") LocalDate fromDate,
            @org.springframework.data.repository.query.Param("toDate") LocalDate toDate,
            @org.springframework.data.repository.query.Param("status") EReservationStatus status,
            Pageable pageable);
}
