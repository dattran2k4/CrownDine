package com.crowndine.presentation.dto.request;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class LayoutObjectSaveRequest {

    private Long id;
    private Integer x;
    private Integer y;
    private Integer width;
    private Integer height;
    private Integer rotation;
}
