package com.crowndine.core.service.impl.notification;

import com.crowndine.presentation.dto.response.NotificationRealtimeResponse;
import com.crowndine.core.entity.Notification;
import com.crowndine.core.service.notification.NotificationRealtimeService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.messaging.simp.user.*;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
@Slf4j(topic = "NOTIFICATION-REALTIME-SERVICE")
public class NotificationRealtimeServiceImpl implements NotificationRealtimeService {

    private final SimpMessagingTemplate messagingTemplate;
    private final SimpUserRegistry simpUserRegistry;

    @Override
    public void sendToUser(Notification notification, long unreadCount) {
        if (notification.getUser() == null || notification.getUser().getUsername() == null) {
            log.warn("Skip realtime notification because user is missing for notification {}", notification.getId());
            return;
        }

        NotificationRealtimeResponse response = new NotificationRealtimeResponse();
        response.setId(notification.getId());
        response.setType(notification.getType());
        response.setTitle(notification.getTitle());
        response.setMessage(notification.getMessage());
        response.setPayload(notification.getPayload());
        response.setCreatedAt(notification.getCreatedAt());
        response.setUnreadCount(unreadCount);

        log.info("Current websocket users before push: {}", simpUserRegistry.getUsers().stream()
                .map(SimpUser::getName)
                .sorted()
                .toList());
        messagingTemplate.convertAndSendToUser(notification.getUser().getUsername(), "/queue/notifications", response);
        log.info("Pushed notification {} to user {}", notification.getId(), notification.getUser().getUsername());
    }
}
