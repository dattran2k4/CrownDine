package com.crowndine.dto.request;

import jakarta.validation.constraints.Min;
import lombok.Getter;

@Getter
public class OrderItemRemoveRequest {
    @Min(1)
    private Long itemId;
    @Min(1)
    private Long comboId;
}
