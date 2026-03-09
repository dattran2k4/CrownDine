package com.crowndine.dto.request;

import jakarta.validation.constraints.Min;
import lombok.Getter;

@Getter
public class UpdateOrderDetailRequest {

    @Min(1)
    private Integer quantity;

    private String note;
}
