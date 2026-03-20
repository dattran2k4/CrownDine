package com.crowndine.service.impl.notification;

import com.crowndine.dto.response.NotificationResponse;
import com.crowndine.dto.response.PageResponse;
import com.crowndine.dto.response.UnreadNotificationCountResponse;
import com.crowndine.exception.ResourceNotFoundException;
import com.crowndine.model.Notification;
import com.crowndine.repository.NotificationRepository;
import com.crowndine.service.notification.NotificationService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j(topic = "NOTIFICATION-SERVICE")
public class NotificationServiceImpl implements NotificationService {

    private final NotificationRepository notificationRepository;

    @Override
    public PageResponse<NotificationResponse> getMyNotifications(String username, int page, int size) {
        int pageNumber = (page > 0) ? page - 1 : 0;
        PageRequest pageRequest = PageRequest.of(pageNumber, size, Sort.by(Sort.Direction.DESC, "createdAt"));
        Page<Notification> notificationPage = notificationRepository.findByUserUsernameOrderByCreatedAtDesc(username, pageRequest);
        List<NotificationResponse> responses = notificationPage.stream().map(this::toResponse).toList();

        return PageResponse.<NotificationResponse>builder()
                .page(page)
                .pageSize(size)
                .totalPages(notificationPage.getTotalPages())
                .totalItems(notificationPage.getTotalElements())
                .data(responses)
                .build();
    }

    @Override
    public UnreadNotificationCountResponse getUnreadCount(String username) {
        long unreadCount = notificationRepository.countByUserUsernameAndReadAtIsNull(username);
        return new UnreadNotificationCountResponse(unreadCount);
    }

    @Override
    @Transactional
    public NotificationResponse markAsRead(Long notificationId, String username) {
        Notification notification = notificationRepository.findByIdAndUserUsername(notificationId, username).orElseThrow(() -> new ResourceNotFoundException("Notification not found"));

        if (notification.getReadAt() == null) {
            notification.setReadAt(LocalDateTime.now());
            log.info("Notification {} marked as read by {}", notificationId, username);
        }

        return toResponse(notification);
    }

    private NotificationResponse toResponse(Notification notification) {
        NotificationResponse response = new NotificationResponse();
        response.setId(notification.getId());
        response.setType(notification.getType());
        response.setTitle(notification.getTitle());
        response.setMessage(notification.getMessage());
        response.setPayload(notification.getPayload());
        response.setReadAt(notification.getReadAt());
        response.setCreatedAt(notification.getCreatedAt());
        return response;
    }
}
