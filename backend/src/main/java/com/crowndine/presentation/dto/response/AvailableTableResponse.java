package com.crowndine.presentation.dto.response;

import com.crowndine.common.enums.ETableShape;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class AvailableTableResponse {
    private Long id;
    private String name;
    private Integer capacity;
    private java.math.BigDecimal baseDeposit;
    private Long areaId;
    private String areaName;
    private Long floorId;
    private String floorName;
    private Integer floorNumber;
    private ETableShape shape;
    private Integer x;
    private Integer y;
    private Integer width;
    private Integer height;
    private Integer rotation;
}