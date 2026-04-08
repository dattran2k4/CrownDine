package com.crowndine.presentation.dto.response;

import com.crowndine.common.enums.ENotificationType;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
public class NotificationResponse {
    private Long id;
    private ENotificationType type;
    private String title;
    private String message;
    private String payload;
    private LocalDateTime readAt;
    private LocalDateTime createdAt;
}
