package com.crowndine.dto.response;

import com.crowndine.common.enums.EReservationStatus;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;
import java.time.LocalTime;

@Getter
@Setter
public class ReservationCreateResponse {
    private Long reservationId;
    private Long tableId;
    private LocalDate date;
    private LocalTime startTime;
    private LocalTime endTime;
    private Integer guestNumber;
    private String note;
    private EReservationStatus status;
    private String tableName;
    private Integer floorNumber;
}
