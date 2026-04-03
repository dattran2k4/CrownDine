package com.crowndine.repository;

import com.crowndine.common.enums.EOrderStatus;
import com.crowndine.model.Order;

import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;

import org.springframework.data.domain.Page;
import org.springframework.data.repository.query.Param;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

public interface OrderRepository extends JpaRepository<Order, Long>, JpaSpecificationExecutor<Order> {
    Optional<Order> findByCode(String code);

    long countByStatusAndCreatedAtBetween(EOrderStatus status, LocalDateTime start, LocalDateTime end);

    @Query("SELECT SUM(o.finalPrice) FROM Order o WHERE o.status = :status AND o.createdAt BETWEEN :start AND :end")
    BigDecimal sumTotalAmountByStatusAndCreatedAtBetween(EOrderStatus status,
                                                         LocalDateTime start, LocalDateTime end);

    List<Order> findAllByStatusAndCreatedAtBetween(EOrderStatus status, LocalDateTime start, LocalDateTime end);

    List<Order> findAllByCreatedAtBetween(LocalDateTime start, LocalDateTime end);

    List<Order> findByStatusIn(List<EOrderStatus> statuses);

    @Query("SELECT o FROM Order o WHERE o.user.id = :userId")
    Page<Order> findByUser_Id(@Param("userId") Long userId, Pageable pageable);

    @Query("SELECT o FROM Order o WHERE o.user.id = :userId AND o.reservation IS NULL")
    Page<Order> findByUser_IdAndReservationIsNull(@Param("userId") Long userId, Pageable pageable);

    @Query("SELECT o FROM Order o WHERE o.user.id = :userId AND o.reservation IS NULL")
    List<Order> findAllByUser_IdAndReservationIsNull(@Param("userId") Long userId);

    @Query("""
            SELECT o FROM Order o
            WHERE o.user.id = :userId
              AND o.voucher.id = :voucherId
              AND o.id <> :excludedOrderId
              AND o.status NOT IN :finalStatuses
            """)
    List<Order> findActiveOrdersUsingVoucherByUserId(@Param("userId") Long userId,
                                                     @Param("voucherId") Long voucherId,
                                                     @Param("excludedOrderId") Long excludedOrderId,
                                                     @Param("finalStatuses") List<EOrderStatus> finalStatuses);


    List<Order> findTop50ByUpdatedByIsNotNullOrderByUpdatedAtDesc();
}
