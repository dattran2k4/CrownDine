package com.crowndine.model;

import com.crowndine.common.enums.EReservationStatus;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "reservations")
public class Reservation extends AbstractEntity<Long> {

    @Column(name = "start_time")
    private LocalTime startTime;

    @Column(name = "end_time")
    private LocalTime endTime;

    @Column(name = "checked_out_at")
    private LocalDateTime checkedOutAt;

    @Column(name = "date")
    private LocalDate date;

    @Column(name = "guest_number")
    private Integer guestNumber;

    @Column(name = "note")
    private String note;

    @Column(name = "expirated_at")
    private LocalDateTime expiratedAt;

    @Column(name = "code", unique = true, nullable = false, updatable = false)
    private String code;

    @Enumerated(EnumType.STRING)
    @Column(name = "status")
    private EReservationStatus status;

    @ManyToOne
    @JoinColumn(name = "customer_id")
    private User user;

    @ManyToOne
    @JoinColumn(name = "restaurant_table_id")
    private RestaurantTable table;

    @OneToOne(mappedBy = "reservation")
    private Order order;

    @OneToMany(mappedBy = "reservation")
    private List<Payment> payments = new ArrayList<>();


}
