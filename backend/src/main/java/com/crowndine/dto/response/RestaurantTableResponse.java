package com.crowndine.dto.response;

import com.crowndine.common.enums.ETableShape;
import com.crowndine.common.enums.ETableStatus;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class RestaurantTableResponse {

    private Long id;

    private String name;

    private ETableStatus status;

    private Integer capacity;

    private ETableShape shape;

    private String imageUrl;

    private String description;

    private Long areaId;
    private String areaName;
    private Long floorId;
    private String floorName;
}
