package com.crowndine.ai.schema.response;

import java.util.List;

public record EmptyTablesResponse(List<TableAvailability> tables) {

    public record TableAvailability(int tableId, String zone, String status) {
    }
}
