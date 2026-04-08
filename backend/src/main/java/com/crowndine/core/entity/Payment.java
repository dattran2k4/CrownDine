package com.crowndine.core.entity;

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

    @Column(name = "code", unique = true, nullable = false)
    private Long code;

    @Column(name = "amount")
    private BigDecimal amount;

    @Column(name = "transaction_code")
    private String transactionCode;

    @Column(name = "raw_api_data", columnDefinition = "TEXT")
    private String rawApiData; //webhook callback

    @Enumerated(EnumType.STRING)
    @Column(name = "method")
    private EPaymentMethod method;

    @Enumerated(EnumType.STRING)
    @Column(name = "status")
    private EPaymentStatus status;

    @Enumerated(EnumType.STRING)
    @Column(name = "type")
    private EPaymentType type;

    @Enumerated(EnumType.STRING)
    @Column(name = "target")
    private EPaymentTarget target;

    @Enumerated(EnumType.STRING)
    @Column(name = "source")
    private EPaymentSource source;

    @ManyToOne
    @JoinColumn(name = "reservation_id")
    private Reservation reservation;

    @ManyToOne
    @JoinColumn(name = "order_id")
    private Order order;

    @ManyToOne
    @JoinColumn(name = "user_id", nullable = false)
    private User user;
}
