package com.crowndine.ai.schema.response;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

public record ReservationListResponse(
        int page,
        int pageSize,
        int totalPages,
        long totalItems,
        List<ReservationSummary> reservations
) {
    public record ReservationSummary(
            Long id,
            String code,
            String customerName,
            LocalDate date,
            LocalTime startTime,
            Integer guestNumber,
            String tableName,
            String status,
            Long orderId
    ) {
    }
}
