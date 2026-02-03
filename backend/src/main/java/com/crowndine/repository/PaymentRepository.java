package com.crowndine.repository;

import com.crowndine.common.enums.EPaymentStatus;
import com.crowndine.common.enums.EPaymentTarget;
import com.crowndine.model.Payment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface PaymentRepository extends JpaRepository<Payment, Long> {
    Optional<Payment> findByCode(Long code);

    //Các giao dịch CỌC đã THÀNH CÔNG của bàn
    List<Payment> findByTargetAndReservationIdAndStatus(EPaymentTarget ePaymentTarget, Long id, EPaymentStatus ePaymentStatus);
}
