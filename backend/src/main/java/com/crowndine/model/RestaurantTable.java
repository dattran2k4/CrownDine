package com.crowndine.model;

import com.crowndine.common.enums.ETableShape;
import com.crowndine.common.enums.ETableStatus;
import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "restaurant_tables")
public class RestaurantTable extends AbstractEntity<Long> {

    @Column(name = "name", length = 50)
    private String name;

    @Column(name = "capacity")
    private Integer capacity;

    @Column(name = "base_deposit", precision = 12, scale = 2)
    private BigDecimal baseDeposit;

    @Enumerated(EnumType.STRING)
    @Column(name = "shape", nullable = false)
    private ETableShape shape;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false)
    private ETableStatus status;

    @Column(name = "position_x")
    private Integer positionX;

    @Column(name = "position_y")
    private Integer positionY;

    @Column(name = "width")
    private Integer width;

    @Column(name = "height")
    private Integer height;

    @Column(name = "rotation")
    private Integer rotation;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "area_id")
    private Area area;
}
