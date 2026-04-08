package com.crowndine.presentation.controller;

import com.crowndine.presentation.dto.response.ApiResponse;
import com.crowndine.core.service.notification.NotificationService;
import jakarta.validation.constraints.Min;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.security.Principal;

@RestController
@Validated
@RequiredArgsConstructor
@RequestMapping("/api/notifications")
@Slf4j(topic = "API-NOTIFICATION-CONTROLLER")
public class ApiNotificationController {

    private final NotificationService notificationService;

    @PreAuthorize("isAuthenticated()")
    @GetMapping
    public ApiResponse getMyNotifications(@RequestParam(defaultValue = "1") @Min(1) int page,
                                          @RequestParam(defaultValue = "10") @Min(1) int size,
                                          Principal principal) {
        return ApiResponse.builder()
                .status(HttpStatus.OK.value())
                .message("Successfully retrieved notifications")
                .data(notificationService.getMyNotifications(principal.getName(), page, size))
                .build();
    }

    @PreAuthorize("isAuthenticated()")
    @GetMapping("/unread-count")
    public ApiResponse getUnreadCount(Principal principal) {
        return ApiResponse.builder()
                .status(HttpStatus.OK.value())
                .message("Successfully retrieved unread notification count")
                .data(notificationService.getUnreadCount(principal.getName()))
                .build();
    }

    @PreAuthorize("isAuthenticated()")
    @PatchMapping("/{id}/read")
    public ApiResponse markAsRead(@PathVariable @Min(1) Long id, Principal principal) {
        return ApiResponse.builder()
                .status(HttpStatus.OK.value())
                .message("Successfully marked notification as read")
                .data(notificationService.markAsRead(id, principal.getName()))
                .build();
    }
}
