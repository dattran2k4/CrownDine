package com.crowndine.model;

import com.crowndine.common.enums.*;
import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "payments")
public class Payment extends AbstractEntity<Long> {

    @Column(name = "amount")
    private BigDecimal amount;

    @Column(name = "transaction_code")
    private String transactionCode;

    @Enumerated(EnumType.STRING)
    @Column(name = "method")
    private EPaymentMethod method;

    @Enumerated(EnumType.STRING)
    @Column(name = "status")
    private EPaymentStatus status;

    @Enumerated(EnumType.STRING)
    @Column(name = "type")
    private EPaymentType type;

    @ManyToOne
    @JoinColumn(name = "reservation_id")
    private Reservation reservation;

    @ManyToOne
    @JoinColumn(name = "order_id")
    private Order order;
}
