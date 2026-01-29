package com.crowndine.dto.response;

import lombok.Getter;
import lombok.Setter;
import java.util.List;

@Getter @Setter
public class FloorLayoutResponse {

    private Long floorId;
    private String floorName;
    private List<AreaLayoutResponse> areas;
}
