package com.crowndine.ai.schema.request;

public record ReservationListRequest(
        String fromDate,
        String toDate,
        String status,
        Integer page,
        Integer size
) {
}
