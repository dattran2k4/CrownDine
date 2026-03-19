package com.crowndine.dto.response;


import com.crowndine.common.enums.EItemStatus;
import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Getter
@Setter
@Builder
public class ItemResponse {

    private Long id;

    private String name;
    private String description;
    private String imageUrl;

    private BigDecimal price;
    private BigDecimal priceAfterDiscount;

    private EItemStatus status;

    private Long categoryId;
    private Double averageRating;
    private Integer feedbackCount;

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
