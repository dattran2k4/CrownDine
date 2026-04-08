package com.crowndine.presentation.dto.response;

import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
public class ReservationCreateResponse {
    private Long reservationId;
    private String reservationCode;
    private LocalDateTime expiratedAt;
}
