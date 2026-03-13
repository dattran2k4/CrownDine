package com.crowndine.dto.request;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotEmpty;
import lombok.Getter;

import java.util.List;

@Getter
public class OrderRequest {

    private Long tableId;

    @Valid
    @NotEmpty
    private List<OrderItemRequest> items;
}
