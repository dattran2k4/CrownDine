package com.crowndine.core.service.notification;

import com.crowndine.presentation.dto.response.NotificationResponse;
import com.crowndine.presentation.dto.response.PageResponse;
import com.crowndine.presentation.dto.response.UnreadNotificationCountResponse;

public interface NotificationService {
    PageResponse<NotificationResponse> getMyNotifications(String username, int page, int size);

    UnreadNotificationCountResponse getUnreadCount(String username);

    NotificationResponse markAsRead(Long notificationId, String username);

    void notifyReservationConfirmed(Long reservationId);

    void notifyVoucherGranted(Long userVoucherId);

    void notifyReservationReminder(Long reservationId);
}
