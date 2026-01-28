package com.crowndine.dto.request;

import com.crowndine.common.enums.ETableShape;
import com.crowndine.common.enums.ETableStatus;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class TableRequest {

    private String name;
    private Integer capacity;
    private ETableShape shape;
    private ETableStatus status; // optional
}
