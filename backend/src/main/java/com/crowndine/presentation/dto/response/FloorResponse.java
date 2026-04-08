package com.crowndine.presentation.dto.response;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class FloorResponse {

    private Long id;
    private String name;
    private Integer floorNumber;
    private String description;
}
