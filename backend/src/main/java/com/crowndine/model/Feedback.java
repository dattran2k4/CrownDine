package com.crowndine.model;

import com.crowndine.common.enums.EFeedbackStatus;
import jakarta.persistence.*;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(
        name = "feedbacks",
        uniqueConstraints = @UniqueConstraint(
                name = "uq_feedbacks_user_order",
                columnNames = {"user_id", "order_id"}
        )
)
public class Feedback extends AbstractEntity<Long> {

    @Column(name = "rating")
    private Integer rating;

    @Column(name = "comment", length = 200)
    private String comment;

    @Column(name = "guest_name", length = 100)
    private String guestName;

    @Column(name = "guest_email")
    private String guestEmail;

    @Column(name = "is_featured")
    private Boolean isFeatured = false;

    @Enumerated(EnumType.STRING)
    @Column(name = "status")
    private EFeedbackStatus status = EFeedbackStatus.APPROVED;

    @ManyToOne
    @JoinColumn(name = "item_id")
    private Item item;

    @ManyToOne
    @JoinColumn(name = "combo_id")
    private Combo combo;

    @ManyToOne
    @JoinColumn(name = "order_id")
    private Order order;

    @ManyToOne
    @JoinColumn(name = "order_detail_id")
    private OrderDetail orderDetail;

    @ManyToOne
    @JoinColumn(name = "user_id")
    private User user;
}