package com.crowndine.ai.schema.response;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

public record ReservationDetailResponse(
        Long reservationId,
        String reservationCode,
        String customerName,
        String phone,
        String email,
        LocalDate date,
        LocalTime startTime,
        LocalTime endTime,
        Integer guestNumber,
        String tableName,
        String status,
        Long orderId,
        BigDecimal finalPrice,
        BigDecimal depositAmount,
        List<ReservationOrderItem> items
) {
    public record ReservationOrderItem(
            Long orderDetailId,
            String name,
            String type,
            Integer quantity,
            BigDecimal totalPrice
    ) {
    }
}
