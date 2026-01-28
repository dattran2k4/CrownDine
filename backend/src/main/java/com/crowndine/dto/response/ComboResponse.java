package com.crowndine.dto.response;

import com.crowndine.common.enums.EComboStatus;
import lombok.*;

import java.math.BigDecimal;
import java.util.List;

@Getter
@Setter
@Builder

public class ComboResponse {
    private Long id;

    private String name;
    private String description;

    private BigDecimal price;
    private BigDecimal priceAfterDiscount;

    private EComboStatus status;

    private String imageUrl;

    private List<ComboItemResponse> items;
}
