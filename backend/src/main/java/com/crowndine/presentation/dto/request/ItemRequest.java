package com.crowndine.presentation.dto.request;

import com.crowndine.common.enums.EItemStatus;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;

import java.math.BigDecimal;

@Getter
public class ItemRequest {
    @NotBlank(message = "Tên không được để trống")
    private String name;

    private String description;
    private String imageUrl;

    @NotNull(message = "Giá không được để trống")
    private BigDecimal price;

    private BigDecimal priceAfterDiscount;

    @NotNull(message = "Status không được để trống")
    private EItemStatus status;

    @NotNull(message = "CategoryId không được để trống")
    private Long categoryId;
}
