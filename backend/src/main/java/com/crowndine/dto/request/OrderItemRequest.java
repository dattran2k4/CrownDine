package com.crowndine.dto.request;

import jakarta.validation.constraints.Min;
import lombok.Getter;

@Getter
public class OrderItemRequest {
    @Min(value = 1, message = "Món ăn không hợp lý")
    private Long itemId;

    @Min(value = 1, message = "Số lượng không hợp lý")
    private Integer quantity;

    private String note;
}
