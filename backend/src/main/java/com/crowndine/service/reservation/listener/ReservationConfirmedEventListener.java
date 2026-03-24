package com.crowndine.service.reservation.listener;

import com.crowndine.exception.ResourceNotFoundException;
import com.crowndine.model.Reservation;
import com.crowndine.repository.OrderDetailRepository;
import com.crowndine.repository.ReservationRepository;
import com.crowndine.service.mail.MailService;
import com.crowndine.service.notification.NotificationService;
import com.crowndine.service.reservation.event.ReservationConfirmedEvent;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.transaction.event.TransactionPhase;
import org.springframework.transaction.event.TransactionalEventListener;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Component
@RequiredArgsConstructor
@Slf4j(topic = "RESERVATION-CONFIRMED-EVENT-LISTENER")
public class ReservationConfirmedEventListener {

    private final NotificationService notificationService;
    private final ReservationRepository reservationRepository;
    private final MailService mailService;
    private final OrderDetailRepository orderDetailRepository;

    /**
     * Tạo notification và gửi email sau khi reservation đã commit thành công.
     */
    @Async("notificationTaskExecutor")
    @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT)
    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public void handle(ReservationConfirmedEvent event) {
        log.info("Handling ReservationConfirmedEvent for reservation id {}", event.reservationId());

        // 1. In-app notification
        notificationService.notifyReservationConfirmed(event.reservationId());

        // 2. Send confirmation email
        sendConfirmationEmail(event.reservationId());
    }

    private void sendConfirmationEmail(Long reservationId) {
        Reservation reservation = reservationRepository.findById(reservationId)
                .orElseThrow(() -> new ResourceNotFoundException("Reservation not found"));

        if (reservation.getUser() == null) {
            log.warn("Reservation {} has no user. Skip sending confirmation email.", reservationId);
            return;
        }

        // Order Details
        List<Map<String, Object>> items = new ArrayList<>();
        BigDecimal totalPrice = BigDecimal.ZERO;
        BigDecimal discountPrice = BigDecimal.ZERO;
        BigDecimal finalPrice = BigDecimal.ZERO;

        if (reservation.getOrder() != null) {
            totalPrice = reservation.getOrder().getTotalPrice();
            discountPrice = reservation.getOrder().getDiscountPrice();
            finalPrice = reservation.getOrder().getFinalPrice();

            List<com.crowndine.model.OrderDetail> details = orderDetailRepository.findByOrder_Id(reservation.getOrder().getId());
            for (com.crowndine.model.OrderDetail detail : details) {
                Map<String, Object> itemMap = new HashMap<>();
                itemMap.put("name", detail.getProductName());
                itemMap.put("quantity", detail.getQuantity());
                itemMap.put("price", detail.getTotalPrice());
                itemMap.put("note", detail.getNote());
                itemMap.put("imageUrl", detail.getCombo() != null ? detail.getCombo().getImageUrl() : (detail.getItem() != null ? detail.getItem().getImageUrl() : ""));
                items.add(itemMap);
            }
        }

        // Send Email
        Map<String, Object> emailDetails = new HashMap<>();
        emailDetails.put("customerName", reservation.getUser().getFullName());
        emailDetails.put("reservationCode", reservation.getCode());
        emailDetails.put("date", reservation.getDate().toString());
        emailDetails.put("startTime", reservation.getStartTime().toString());
        emailDetails.put("endTime", reservation.getEndTime().toString());
        emailDetails.put("guestNumber", reservation.getGuestNumber());
        emailDetails.put("tableName", reservation.getTable() != null ? reservation.getTable().getName() : "N/A");
        emailDetails.put("note", reservation.getNote() != null ? reservation.getNote() : "Không có");
        emailDetails.put("historyLink", "http://localhost:5173/profile");
        emailDetails.put("items", items);
        emailDetails.put("totalPrice", totalPrice);
        emailDetails.put("discountPrice", discountPrice);
        emailDetails.put("finalPrice", finalPrice);

        mailService.sendReservationSuccessEmail(reservation.getUser().getEmail(), emailDetails);
        log.info("Sent confirmation email for reservation {} and user {}", reservationId, reservation.getUser().getUsername());
    }
}
