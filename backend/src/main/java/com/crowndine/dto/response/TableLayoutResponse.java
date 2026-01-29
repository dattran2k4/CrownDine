package com.crowndine.dto.response;

import com.crowndine.common.enums.ETableShape;
import com.crowndine.common.enums.ETableStatus;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class TableLayoutResponse {

    private Long id;
    private String name;

    private ETableShape shape;
    private ETableStatus status;

    private Integer x;
    private Integer y;
    private Integer width;
    private Integer height;
    private Integer rotation;
}
