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
    private Long orderId;
    private Long orderDetailId;
    private Long userId;
    private String fullName;
    private String avatarUrl;
    private String guestName;
    private Boolean isFeatured;
    private String status;

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}