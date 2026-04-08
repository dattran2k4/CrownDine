package com.crowndine.presentation.dto.request;

import lombok.Getter;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
public class AreaLayoutSaveRequest {
    private Long areaId;
    private Double x;
    private Double y;
    private Double width;
    private Double height;
    private List<LayoutObjectSaveRequest> objects;
}

