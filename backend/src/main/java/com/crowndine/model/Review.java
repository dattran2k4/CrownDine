package com.crowndine.model;

import jakarta.persistence.*;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "reviews")
public class Review extends AbstractEntity<Long> {

    @Column(name = "comment")
    private String comment;

    @ManyToOne
    @JoinColumn(name = "customer_id")
    private User customer;
}
