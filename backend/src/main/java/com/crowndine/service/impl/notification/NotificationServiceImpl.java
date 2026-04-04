package com.crowndine.service.impl.notification;

import com.crowndine.common.enums.ENotificationType;
import com.crowndine.dto.response.NotificationResponse;
import com.crowndine.dto.response.PageResponse;
import com.crowndine.dto.response.UnreadNotificationCountResponse;
import com.crowndine.exception.ResourceNotFoundException;
import com.crowndine.model.Notification;
import com.crowndine.model.Reservation;
import com.crowndine.model.UserVoucher;
import com.crowndine.repository.NotificationRepository;
import com.crowndine.repository.ReservationRepository;
import com.crowndine.repository.UserVoucherRepository;
import com.crowndine.service.notification.NotificationRealtimeService;
import com.crowndine.service.notification.NotificationService;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j(topic = "NOTIFICATION-SERVICE")
public class NotificationServiceImpl implements NotificationService {

    private final NotificationRepository notificationRepository;
    private final ReservationRepository reservationRepository;
    private final UserVoucherRepository userVoucherRepository;
    private final NotificationRealtimeService notificationRealtimeService;
    private final ObjectMapper objectMapper;

    @Override
    public PageResponse<NotificationResponse> getMyNotifications(String username, int page, int size) {
        int pageNumber = (page > 0) ? page - 1 : 0;
        PageRequest pageRequest = PageRequest.of(pageNumber, size, Sort.by(Sort.Direction.DESC, "createdAt"));
        Page<Notification> notificationPage = notificationRepository.findByUserUsernameOrderByCreatedAtDesc(username,
                pageRequest);
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
        Notification notification = notificationRepository.findByIdAndUserUsername(notificationId, username)
                .orElseThrow(() -> new ResourceNotFoundException("Notification not found"));

        if (notification.getReadAt() == null) {
            notification.setReadAt(LocalDateTime.now());
            log.info("Notification {} marked as read by {}", notificationId, username);
        }

        return toResponse(notification);
    }

    @Override
    @Transactional
    public void notifyReservationConfirmed(Long reservationId) {
        Reservation reservation = reservationRepository.findById(reservationId)
                .orElseThrow(() -> new ResourceNotFoundException("Reservation not found"));

        if (reservation.getUser() == null) {
            log.warn("Reservation {} has no user. Skip reservation confirmed notification.", reservationId);
            return;
        }

        Notification notification = new Notification();
        notification.setUser(reservation.getUser());
        notification.setType(ENotificationType.RESERVATION_CONFIRMED);
        notification.setTitle("Đặt bàn thành công");
        notification.setMessage(buildReservationConfirmedMessage(reservation));
        notification.setPayload(buildReservationConfirmedPayload(reservation));
        Notification savedNotification = notificationRepository.save(notification);
        pushRealtimeNotification(savedNotification);

        log.info("Created reservation confirmed notification for reservation {} and user {}",
                reservationId, reservation.getUser().getUsername());
    }

    @Override
    @Transactional
    public void notifyVoucherGranted(Long userVoucherId) {
        UserVoucher userVoucher = userVoucherRepository.findById(userVoucherId)
                .orElseThrow(() -> new ResourceNotFoundException("User voucher not found"));

        if (userVoucher.getCustomer() == null || userVoucher.getVoucher() == null) {
            log.warn("UserVoucher {} is missing customer or voucher. Skip voucher granted notification.",
                    userVoucherId);
            return;
        }

        Notification notification = new Notification();
        notification.setUser(userVoucher.getCustomer());
        notification.setType(ENotificationType.VOUCHER_GRANTED);
        notification.setTitle("Bạn nhận được voucher mới");
        notification.setMessage(buildVoucherGrantedMessage(userVoucher));
        notification.setPayload(buildVoucherGrantedPayload(userVoucher));
        Notification savedNotification = notificationRepository.save(notification);
        pushRealtimeNotification(savedNotification);
        log.info("Created voucher granted notification for userVoucher {} and user {}", userVoucherId,
                userVoucher.getCustomer().getUsername());
    }

    @Override
    @Transactional
    public void notifyReservationReminder(Long reservationId) {
        Reservation reservation = reservationRepository.findById(reservationId)
                .orElseThrow(() -> new ResourceNotFoundException("Reservation not found"));

        if (reservation.getUser() == null) {
            log.warn("Reservation {} has no user. Skip reservation reminder notification.", reservationId);
            return;
        }

        if (reservation.getReminderSentAt() != null) {
            log.info("Reservation {} reminder already sent. Skip duplicate reminder.", reservationId);
            return;
        }

        Notification notification = new Notification();
        notification.setUser(reservation.getUser());
        notification.setType(ENotificationType.RESERVATION_REMINDER);
        notification.setTitle("Sắp đến giờ đặt bàn");
        notification.setMessage(buildReservationReminderMessage(reservation));
        notification.setPayload(buildReservationReminderPayload(reservation));
        Notification savedNotification = notificationRepository.save(notification);

        reservation.setReminderSentAt(LocalDateTime.now());
        reservationRepository.save(reservation);
        pushRealtimeNotification(savedNotification);
        log.info("Created reservation reminder notification for reservation {} and user {}", reservationId,
                reservation.getUser().getUsername());
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

    private String buildReservationConfirmedMessage(Reservation reservation) {
        String tableName = reservation.getTable() != null ? reservation.getTable().getName() : "bàn đã chọn";
        return "Bàn " + tableName + " của bạn đã được xác nhận vào " + reservation.getStartTime() + " ngày "
                + reservation.getDate() + ".";
    }

    private String buildReservationConfirmedPayload(Reservation reservation) {
        try {
            return objectMapper.writeValueAsString(new ReservationConfirmedPayload(reservation.getId(),
                    reservation.getCode(), reservation.getDate(), reservation.getStartTime(), reservation.getEndTime(),
                    reservation.getTable() != null ? reservation.getTable().getId() : null,
                    reservation.getTable() != null ? reservation.getTable().getName() : null));
        } catch (JsonProcessingException e) {
            log.warn("Cannot serialize reservation confirmed payload for reservation {}", reservation.getId(), e);
            return null;
        }
    }

    private String buildVoucherGrantedMessage(UserVoucher userVoucher) {
        String voucherName = userVoucher.getVoucher().getName();
        String voucherCode = userVoucher.getVoucher().getCode();
        return "Voucher " + voucherName + " (" + voucherCode + ") đã được thêm vào tài khoản của bạn.";
    }

    private String buildVoucherGrantedPayload(UserVoucher userVoucher) {
        try {
            return objectMapper.writeValueAsString(new VoucherGrantedPayload(userVoucher.getId(),
                    userVoucher.getVoucher().getId(), userVoucher.getVoucher().getCode(),
                    userVoucher.getVoucher().getName(), userVoucher.getUsageLimit(), userVoucher.getExpiredAt()));
        } catch (JsonProcessingException e) {
            log.warn("Cannot serialize voucher granted payload for userVoucher {}", userVoucher.getId(), e);
            return null;
        }
    }

    private String buildReservationReminderMessage(Reservation reservation) {
        String tableName = reservation.getTable() != null ? reservation.getTable().getName() : "bàn đã chọn";
        return "Bạn có lịch đặt bàn " + tableName + " vào " + reservation.getStartTime() + " ngày "
                + reservation.getDate() + ".";
    }

    private String buildReservationReminderPayload(Reservation reservation) {
        try {
            return objectMapper.writeValueAsString(new ReservationReminderPayload(reservation.getId(),
                    reservation.getCode(), reservation.getDate(), reservation.getStartTime(), reservation.getEndTime(),
                    reservation.getTable() != null ? reservation.getTable().getId() : null,
                    reservation.getTable() != null ? reservation.getTable().getName() : null));
        } catch (JsonProcessingException e) {
            log.warn("Cannot serialize reservation reminder payload for reservation {}", reservation.getId(), e);
            return null;
        }
    }

    private void pushRealtimeNotification(Notification notification) {
        if (notification.getUser() == null || notification.getUser().getUsername() == null) {
            return;
        }

        long unreadCount = notificationRepository
                .countByUserUsernameAndReadAtIsNull(notification.getUser().getUsername());
        notificationRealtimeService.sendToUser(notification, unreadCount);
    }

    private record ReservationConfirmedPayload(
            Long reservationId, String reservationCode, LocalDate date, LocalTime startTime, LocalTime endTime,
            Long tableId, String tableName) {
    }

    private record VoucherGrantedPayload(
            Long assignmentId, Long voucherId, String voucherCode, String voucherName, Integer usageLimit,
            LocalDateTime expiredAt) {
    }

    private record ReservationReminderPayload(
            Long reservationId, String reservationCode, LocalDate date, LocalTime startTime, LocalTime endTime,
            Long tableId, String tableName) {
    }
}
