package com.crowndine.presentation.dto.request;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;

@Getter
public class OrderItemUpdateRefinedRequest {

    @Min(1)
    @NotNull(message = "Chưa có số lượng")
    private Integer quantity;

    private String note;
}
