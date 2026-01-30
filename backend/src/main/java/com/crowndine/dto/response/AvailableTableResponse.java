package com.crowndine.dto.response;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class AvailableTableResponse {
    private Long id;
    private String name;
    private Integer capacity;
    private Long areaId;
    private String areaName;
    private Long floorId;
    private String floorName;
    private Integer floorNumber;
}