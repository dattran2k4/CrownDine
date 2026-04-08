package com.crowndine.core.service.notification;

import com.crowndine.core.entity.Notification;

public interface NotificationRealtimeService {
    void sendToUser(Notification notification, long unreadCount);
}
