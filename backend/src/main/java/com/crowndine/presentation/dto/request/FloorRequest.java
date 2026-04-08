package com.crowndine.presentation.dto.request;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class FloorRequest {

    private String name;
    private Integer floorNumber;
    private String description;
}
