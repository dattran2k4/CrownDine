package com.crowndine.service.notification;

import com.crowndine.dto.response.NotificationResponse;
import com.crowndine.dto.response.PageResponse;
import com.crowndine.dto.response.UnreadNotificationCountResponse;

public interface NotificationService {
    PageResponse<NotificationResponse> getMyNotifications(String username, int page, int size);

    UnreadNotificationCountResponse getUnreadCount(String username);

    NotificationResponse markAsRead(Long notificationId, String username);

    void notifyReservationConfirmed(Long reservationId);
}
