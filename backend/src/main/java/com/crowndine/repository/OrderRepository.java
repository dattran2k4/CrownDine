package com.crowndine.repository;

import com.crowndine.common.enums.EOrderStatus;
import com.crowndine.model.Order;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;

import org.springframework.data.domain.Page;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

public interface OrderRepository extends JpaRepository<Order, Long>, JpaSpecificationExecutor<Order> {
    Optional<Order> findByCode(String code);

    long countByStatusAndCreatedAtBetween(EOrderStatus status, LocalDateTime start, LocalDateTime end);

    @Query("SELECT SUM(o.finalPrice) FROM Order o WHERE o.status = :status AND o.createdAt BETWEEN :start AND :end")
    BigDecimal sumTotalAmountByStatusAndCreatedAtBetween(com.crowndine.common.enums.EOrderStatus status,
                                                         java.time.LocalDateTime start, java.time.LocalDateTime end);

    List<Order> findAllByStatusAndCreatedAtBetween(EOrderStatus status, LocalDateTime start, LocalDateTime end);

    List<Order> findAllByCreatedAtBetween(LocalDateTime start, LocalDateTime end);

    @Query("SELECT o FROM Order o WHERE o.user.id = :userId")
    Page<Order> findByUser_Id(@org.springframework.data.repository.query.Param("userId") Long userId, org.springframework.data.domain.Pageable pageable);

    @Query("SELECT o FROM Order o WHERE o.user.id = :userId AND o.reservation IS NULL")
    Page<Order> findByUser_IdAndReservationIsNull(@org.springframework.data.repository.query.Param("userId") Long userId, org.springframework.data.domain.Pageable pageable);

    @Query("SELECT o FROM Order o WHERE o.user.id = :userId AND o.reservation IS NULL")
    List<Order> findAllByUser_IdAndReservationIsNull(@org.springframework.data.repository.query.Param("userId") Long userId);
}
