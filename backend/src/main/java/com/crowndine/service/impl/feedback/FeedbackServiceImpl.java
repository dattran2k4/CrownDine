package com.crowndine.service.impl.feedback;

import com.crowndine.common.enums.EOrderStatus;
import com.crowndine.common.enums.EReservationStatus;
import com.crowndine.dto.request.FeedbackCreateRequest;
import com.crowndine.dto.request.FeedbackUpdateRequest;
import com.crowndine.dto.response.FeedbackResponse;
import com.crowndine.exception.InvalidDataException;
import com.crowndine.exception.ResourceNotFoundException;
import com.crowndine.model.Feedback;
import com.crowndine.model.Order;
import com.crowndine.model.OrderDetail;
import com.crowndine.model.Reservation;
import com.crowndine.model.User;
import com.crowndine.repository.FeedbackRepository;
import com.crowndine.repository.OrderDetailRepository;
import com.crowndine.repository.UserRepository;
import com.crowndine.service.feedback.FeedbackService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j(topic = "FEEDBACK-SERVICE")
public class FeedbackServiceImpl implements FeedbackService {

    private static final long FEEDBACK_WINDOW_HOURS = 48;
    private static final long EDIT_WINDOW_HOURS = 24;

    private final FeedbackRepository feedbackRepository;
    private final UserRepository userRepository;
    private final OrderDetailRepository orderDetailRepository;

    @Override
    @Transactional
    public FeedbackResponse createFeedback(String username, FeedbackCreateRequest request) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        OrderDetail detail = orderDetailRepository.findById(request.getOrderDetailId())
                .orElseThrow(() -> new ResourceNotFoundException("Order detail not found"));

        validateTarget(detail, request);

        Order order = detail.getOrder();
        if (order == null || order.getUser() == null) {
            throw new InvalidDataException("Order không hợp lệ");
        }
        if (!order.getUser().getId().equals(user.getId())) {
            throw new InvalidDataException("Không có quyền feedback đơn này");
        }

        if (feedbackRepository.findByUser_IdAndOrderDetail_Id(user.getId(), detail.getId()).isPresent()) {
            throw new InvalidDataException("Bạn đã feedback món này rồi");
        }

        LocalDateTime completedAt = resolveCompletedAt(detail);
        if (completedAt == null) {
            throw new InvalidDataException("Chỉ được feedback sau khi ăn xong");
        }

        LocalDateTime now = LocalDateTime.now();
        if (now.isBefore(completedAt)) {
            throw new InvalidDataException("Chỉ được feedback sau khi ăn xong");
        }
        if (now.isAfter(completedAt.plusHours(FEEDBACK_WINDOW_HOURS))) {
            throw new InvalidDataException("Đã quá 48 giờ, không thể feedback");
        }

        Feedback feedback = new Feedback();
        feedback.setRating(request.getRating());
        feedback.setComment(request.getComment());
        feedback.setUser(user);
        feedback.setItem(detail.getItem());
        feedback.setCombo(detail.getCombo());
        feedback.setOrderDetail(detail);

        return mapToResponse(feedbackRepository.save(feedback));
    }

    @Override
    @Transactional
    public FeedbackResponse updateFeedback(Long id, String username, FeedbackUpdateRequest request) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        Feedback feedback = feedbackRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Feedback not found"));

        if (feedback.getUser() == null || !feedback.getUser().getId().equals(user.getId())) {
            throw new InvalidDataException("Không có quyền chỉnh sửa feedback này");
        }

        if (feedback.getCreatedAt() != null
                && LocalDateTime.now().isAfter(feedback.getCreatedAt().plusHours(EDIT_WINDOW_HOURS))) {
            throw new InvalidDataException("Chỉ được chỉnh sửa feedback trong 24 giờ");
        }

        feedback.setRating(request.getRating());
        feedback.setComment(request.getComment());

        return mapToResponse(feedbackRepository.save(feedback));
    }

    @Override
    @Transactional(readOnly = true)
    public List<FeedbackResponse> getFeedbacksByItem(Long itemId) {
        return feedbackRepository.findByItem_IdOrderByCreatedAtDesc(itemId)
                .stream().map(this::mapToResponse).toList();
    }

    @Override
    @Transactional(readOnly = true)
    public List<FeedbackResponse> getFeedbacksByCombo(Long comboId) {
        return feedbackRepository.findByCombo_IdOrderByCreatedAtDesc(comboId)
                .stream().map(this::mapToResponse).toList();
    }

    @Override
    @Transactional(readOnly = true)
    public List<FeedbackResponse> getAllFeedbacks() {
        return feedbackRepository.findAll(org.springframework.data.domain.Sort.by(org.springframework.data.domain.Sort.Direction.DESC, "createdAt"))
                .stream().map(this::mapToResponse).toList();
    }

    private void validateTarget(OrderDetail detail, FeedbackCreateRequest request) {
        boolean hasItem = request.getItemId() != null;
        boolean hasCombo = request.getComboId() != null;

        if (hasItem == hasCombo) {
            throw new InvalidDataException("Chỉ chọn item hoặc combo");
        }

        if (hasItem) {
            if (detail.getItem() == null || !detail.getItem().getId().equals(request.getItemId())) {
                throw new InvalidDataException("Item không khớp với order");
            }
        } else {
            if (detail.getCombo() == null || !detail.getCombo().getId().equals(request.getComboId())) {
                throw new InvalidDataException("Combo không khớp với order");
            }
        }
    }

    private LocalDateTime resolveCompletedAt(OrderDetail detail) {
        Order order = detail.getOrder();
        if (order != null && EOrderStatus.COMPLETED.equals(order.getStatus())) {
            if (order.getUpdatedAt() != null) {
                return order.getUpdatedAt();
            }
        }

        Reservation reservation = (order != null) ? order.getReservation() : null;
        if (reservation != null && EReservationStatus.COMPLETED.equals(reservation.getStatus())) {
            if (reservation.getUpdatedAt() != null) {
                return reservation.getUpdatedAt();
            }
            if (reservation.getDate() != null && reservation.getEndTime() != null) {
                return LocalDateTime.of(reservation.getDate(), reservation.getEndTime());
            }
        }

        return null;
    }

    private FeedbackResponse mapToResponse(Feedback feedback) {
        return FeedbackResponse.builder()
                .id(feedback.getId())
                .rating(feedback.getRating())
                .comment(feedback.getComment())
                .itemId(feedback.getItem() != null ? feedback.getItem().getId() : null)
                .comboId(feedback.getCombo() != null ? feedback.getCombo().getId() : null)
                .orderDetailId(feedback.getOrderDetail() != null ? feedback.getOrderDetail().getId() : null)
                .userId(feedback.getUser() != null ? feedback.getUser().getId() : null)
                .fullName(feedback.getUser() != null ? feedback.getUser().getFullName() : (feedback.getGuestName() != null ? feedback.getGuestName() : "Người dùng ẩn danh"))
                .avatarUrl(feedback.getUser() != null ? feedback.getUser().getAvatarUrl() : null)
                .guestName(feedback.getGuestName())
                .isFeatured(feedback.getIsFeatured())
                .status(feedback.getStatus() != null ? feedback.getStatus().name() : null)
                .createdAt(feedback.getCreatedAt())
                .updatedAt(feedback.getUpdatedAt())
                .build();
    }
}