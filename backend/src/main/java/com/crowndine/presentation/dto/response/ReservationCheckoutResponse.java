package com.crowndine.presentation.dto.response;

import com.crowndine.common.enums.EReservationStatus;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Getter
@Setter
public class ReservationCheckoutResponse {
    private Long reservationId;
    private String reservationCode;
    private EReservationStatus reservationStatus;
    private LocalDateTime expiratedAt;
    private Long orderId;
    private ReservationCheckoutTableResponse table;
    private BigDecimal itemsTotal;
    private BigDecimal discountAmount;
    private BigDecimal finalAmount;
    private BigDecimal tableDeposit;
    private BigDecimal depositAmount;
    private BigDecimal remainingAmount;
    private List<OrderLineResponse> items;
}
