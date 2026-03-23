package com.crowndine.model;

import com.crowndine.common.enums.EPointReason;
import jakarta.persistence.*;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "point_histories")
public class PointHistory extends AbstractEntity<Long> {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(name = "points_changed", nullable = false)
    private Integer pointsChanged;

    @Enumerated(EnumType.STRING)
    @Column(name = "reason", nullable = false, length = 50)
    private EPointReason reason;

    @Column(name = "reference_id")
    private Long referenceId;
}
