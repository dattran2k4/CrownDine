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

    @Query(value = """
            select r.restaurant_table_id
            from reservations r
            where r.restaurant_table_id is not null
              and r.date = :date
              and r.status in (:statuses)
              and abs(timestampdiff(minute, r.start_time, :requestStartTime)) < 240
              and (r.status <> 'PENDING' or (r.expirated_at is not null and r.expirated_at > :now))
            """, nativeQuery = true)
    List<Long> findReservedTableIds(
            LocalDate date,
            LocalTime requestStartTime,
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
