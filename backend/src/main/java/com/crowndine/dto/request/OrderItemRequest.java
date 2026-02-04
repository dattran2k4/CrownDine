package com.crowndine.dto.request;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class OrderItemRequest {
    private Long itemId;
    private Long comboId;

    @NotNull
    @Min(1)
    private Integer quantity;

    private String note;
}