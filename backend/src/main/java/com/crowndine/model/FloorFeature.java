package com.crowndine.model;

import jakarta.persistence.*;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "floor_features")
public class FloorFeature extends AbstractEntity<Long> {

    @Column(name = "type", nullable = false, length = 50)
    private String type; // WALL, DOOR, WINDOW, ...

    @Column(name = "label", length = 100)
    private String label;

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
    @JoinColumn(name = "area_id", nullable = false)
    private Area area;
}
