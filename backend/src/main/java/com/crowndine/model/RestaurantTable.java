package com.crowndine.model;

import com.crowndine.common.enums.ETableStatus;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Table(name = "restaurant_tables")
public class RestaurantTable extends AbstractEntity<Long> {

    @Column(name = "name")
    private String name;

    @Column(name = "capacity")
    private Integer capacity;

    @Enumerated(EnumType.STRING)
    private ETableStatus status;
}
