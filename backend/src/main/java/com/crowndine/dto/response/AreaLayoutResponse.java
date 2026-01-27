package com.crowndine.dto.response;

import com.crowndine.model.FloorFeature;
import com.crowndine.model.RestaurantTable;
import lombok.Getter;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
public class AreaLayoutResponse {

    private Long areaId;
    private String areaName;
    private List<RestaurantTable> tables;
    private List<FloorFeature> features;
}
