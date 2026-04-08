package com.crowndine.presentation.dto.response;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class AreaResponse {

    private Long id;
    private String name;
    private String description;
    private Long floorId;
}
