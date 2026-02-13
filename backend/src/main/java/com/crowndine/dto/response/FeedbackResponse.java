package com.crowndine.dto.response;

import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
@Builder
public class FeedbackResponse {
    private Long id;
    private Integer rating;
    private String comment;

    private Long itemId;
    private Long comboId;
    private Long orderDetailId;
    private Long userId;

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}