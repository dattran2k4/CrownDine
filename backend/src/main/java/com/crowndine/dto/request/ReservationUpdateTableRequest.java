package com.crowndine.dto.request;

import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ReservationUpdateTableRequest {
    @NotNull(message = "Table ID is required")
    private Long tableId;
}
