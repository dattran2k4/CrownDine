package com.crowndine.service.notification;

import com.crowndine.model.Notification;

public interface NotificationRealtimeService {
    void sendToUser(Notification notification, long unreadCount);
}
