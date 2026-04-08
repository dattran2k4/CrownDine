package com.crowndine.presentation.dto.request;

import com.crowndine.common.enums.EComboStatus;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.*;

import java.math.BigDecimal;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ComboRequest {

    @NotBlank(message = "Tên combo không được để trống")
    private String name;

    private String description;

    @NotNull(message = "Giá combo không được null")
    private BigDecimal price;

    private BigDecimal priceAfterDiscount;

    private EComboStatus status;

    private String imageUrl;

    private List<ComboItemRequest> items;
}
