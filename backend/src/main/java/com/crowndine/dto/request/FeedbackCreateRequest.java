package com.crowndine.dto.request;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Getter;

@Getter
public class FeedbackCreateRequest {

    @NotNull(message = "Rating không được để trống")
    @Min(value = 1, message = "Rating tối thiểu là 1")
    @Max(value = 5, message = "Rating tối đa là 5")
    private Integer rating;

    @Size(max = 200, message = "Comment tối đa 200 ký tự")
    private String comment;

    private Long itemId;
    private Long comboId;

    @NotNull(message = "OrderDetailId không được để trống")
    private Long orderDetailId;
}