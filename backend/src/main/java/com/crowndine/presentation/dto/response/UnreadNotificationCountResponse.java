package com.crowndine.presentation.dto.response;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class UnreadNotificationCountResponse {
    private long unreadCount;
}
