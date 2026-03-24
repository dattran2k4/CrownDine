package com.crowndine.ai.schema.response;

import java.util.List;

public record AvailableTablesResponse(
        String date,
        String startTime,
        Integer guestNumber,
        int totalTables,
        List<AvailableTableSummary> tables
) {
    public record AvailableTableSummary(
            Long id,
            String name,
            Integer capacity,
            String status,
            String shape
    ) {
    }
}
