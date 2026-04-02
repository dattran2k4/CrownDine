package com.crowndine.dto.response;

import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;

@Getter
@Setter
public class ReservationCheckoutTableResponse {
    private Long id;
    private String name;
    private String areaName;
    private String floorName;
    private BigDecimal deposit;
}
