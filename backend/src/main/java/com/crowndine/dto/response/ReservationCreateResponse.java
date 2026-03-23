package com.crowndine.dto.response;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class ReservationCreateResponse {
    private Long reservationId;
    private String reservationCode;
}
