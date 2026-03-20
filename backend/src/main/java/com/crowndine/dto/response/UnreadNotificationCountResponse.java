package com.crowndine.dto.response;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class UnreadNotificationCountResponse {
    private long unreadCount;
}
