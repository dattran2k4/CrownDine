package com.crowndine.repository;

import com.crowndine.common.enums.EOrderStatus;
import com.crowndine.model.Order;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDateTime;
import java.util.Optional;

public interface OrderRepository extends JpaRepository<Order, Long> {
    Optional<Order> findByCode(String code);

    long countByStatusAndCreatedAtBetween(EOrderStatus status, LocalDateTime start, LocalDateTime end);

    @org.springframework.data.jpa.repository.Query("SELECT SUM(o.finalPrice) FROM Order o WHERE o.status = :status AND o.createdAt BETWEEN :start AND :end")
    java.math.BigDecimal sumTotalAmountByStatusAndCreatedAtBetween(com.crowndine.common.enums.EOrderStatus status,
            java.time.LocalDateTime start, java.time.LocalDateTime end);
}
