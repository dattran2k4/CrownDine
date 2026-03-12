package com.crowndine.repository;

import com.crowndine.common.enums.EPaymentStatus;
import com.crowndine.common.enums.EPaymentTarget;
import com.crowndine.model.Payment;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

@Repository
public interface PaymentRepository extends JpaRepository<Payment, Long> {
    Optional<Payment> findByCode(Long code);

    //Các giao dịch CỌC đã THÀNH CÔNG của bàn
    List<Payment> findByTargetAndReservationIdAndStatus(EPaymentTarget ePaymentTarget, Long id, EPaymentStatus ePaymentStatus);

    @Query("select coalesce(sum(p.amount), 0) from Payment p where p.target = :target and p.reservation.id = :reservationId and p.status = :status")
    BigDecimal sumAmountByTargetAndReservationIdAndStatus(
            @Param("target") EPaymentTarget target,
            @Param("reservationId") Long reservationId,
            @Param("status") EPaymentStatus status
    );
}
