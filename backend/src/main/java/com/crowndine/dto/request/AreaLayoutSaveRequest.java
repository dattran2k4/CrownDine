package com.crowndine.dto.request;

import lombok.Getter;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
public class AreaLayoutSaveRequest {
    private Long areaId;
    private List<LayoutObjectSaveRequest> objects;
}

