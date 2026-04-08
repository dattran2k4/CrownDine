package com.crowndine.core.entity;

import jakarta.persistence.*;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "floors")
public class Floor extends AbstractEntity<Long> {

    @Column(name = "name", nullable = false)
    private String name;

    @Column(name = "floor_number")
    private Integer floorNumber;

    @Column(name = "description", length = 500)
    private String description;
}
