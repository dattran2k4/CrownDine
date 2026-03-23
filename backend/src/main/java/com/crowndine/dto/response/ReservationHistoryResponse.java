package com.crowndine.dto.response;

import com.crowndine.common.enums.EOrderStatus;
import com.crowndine.common.enums.EReservationStatus;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

@Getter
@Setter
public class ReservationHistoryResponse {
    private Long reservationId;
    private LocalDate date;
    private LocalTime startTime;
    private LocalTime endTime;
    private Integer guestNumber;
    private EReservationStatus reservationStatus;
    private String tableName;

    private Long orderId;
    private EOrderStatus orderStatus;
    private BigDecimal finalPrice;
    private List<OrderLineResponse> items;
    private boolean hasGeneralFeedback;
}