package com.crowndine.service.impl.user;

import com.crowndine.common.enums.EPointReason;
import com.crowndine.dto.request.VoucherAssignUsersRequest;
import com.crowndine.exception.InvalidDataException;
import com.crowndine.exception.ResourceNotFoundException;
import com.crowndine.model.Order;
import com.crowndine.model.PointHistory;
import com.crowndine.model.User;
import com.crowndine.model.Voucher;
import com.crowndine.repository.OrderRepository;
import com.crowndine.repository.PointHistoryRepository;
import com.crowndine.repository.UserRepository;
import com.crowndine.repository.VoucherRepository;
import com.crowndine.service.user.RewardPointService;
import com.crowndine.service.voucher.UserVoucherService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.crowndine.dto.response.PageResponse;
import com.crowndine.dto.response.PointHistoryResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Collections;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j(topic = "REWARD-POINT-SERVICE")
public class RewardPointServiceImpl implements RewardPointService {

    private final OrderRepository orderRepository;
    private final UserRepository userRepository;
    private final VoucherRepository voucherRepository;
    private final PointHistoryRepository pointHistoryRepository;
    private final UserVoucherService userVoucherService;

    private static final BigDecimal POINT_CONVERSION_RATE = BigDecimal.valueOf(100000);
    private static final int VOUCHER_VALIDITY_MONTHS = 1;

    @Override
    @Transactional(rollbackFor = Exception.class)
    public void addPointsFromOrder(Long orderId) {
        Order order = orderRepository.findById(orderId).orElse(null);
        if (order == null || order.getUser() == null || order.getFinalPrice() == null) {
            return;
        }

        BigDecimal finalPrice = order.getFinalPrice();
        if (finalPrice.compareTo(BigDecimal.ZERO) <= 0) {
            return;
        }

        int pointsToAdd = finalPrice.divide(POINT_CONVERSION_RATE).intValue();
        if (pointsToAdd <= 0) {
            return;
        }

        User user = order.getUser();
        user.setRewardPoints(user.getRewardPoints() + pointsToAdd);
        userRepository.save(user);

        PointHistory history = new PointHistory();
        history.setUser(user);
        history.setPointsChanged(pointsToAdd);
        history.setReason(EPointReason.EARN_FROM_ORDER);
        history.setReferenceId(orderId);
        pointHistoryRepository.save(history);

        log.info("Added {} points to user {} for order {}", pointsToAdd, user.getUsername(), orderId);
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public void exchangeVoucher(Long voucherId, String username) {
        User user = userRepository.findByUsername(username).orElseThrow(() -> new ResourceNotFoundException("User not found"));
        Voucher voucher = voucherRepository.findById(voucherId).orElseThrow(() -> new ResourceNotFoundException("Voucher not found"));

        if (voucher.getPointsRequired() == null || voucher.getPointsRequired() <= 0) {
            throw new InvalidDataException("Voucher này không thể đổi bằng điểm");
        }

        if (user.getRewardPoints() < voucher.getPointsRequired()) {
            throw new InvalidDataException("Không đủ điểm để đổi voucher này");
        }

        user.setRewardPoints(user.getRewardPoints() - voucher.getPointsRequired());
        userRepository.save(user);

        PointHistory history = new PointHistory();
        history.setUser(user);
        history.setPointsChanged(-voucher.getPointsRequired());
        history.setReason(EPointReason.SPEND_ON_VOUCHER);
        history.setReferenceId(voucherId);
        pointHistoryRepository.save(history);

        VoucherAssignUsersRequest assignRequest = new VoucherAssignUsersRequest();
        assignRequest.setUserIds(Collections.singletonList(user.getId()));
        assignRequest.setUsageLimit(1);
        assignRequest.setExpiredAt(LocalDateTime.now().plusMonths(VOUCHER_VALIDITY_MONTHS));
        userVoucherService.assignUsers(voucherId, assignRequest);

        log.info("User {} exchanged {} points for voucher {}", username, voucher.getPointsRequired(), voucherId);
    }

    @Override
    public PageResponse<PointHistoryResponse> getMyPointHistory(String username, int page, int size) {
        User user = userRepository.findByUsername(username).orElseThrow(() -> new ResourceNotFoundException("User not found"));
        
        Pageable pageable = PageRequest.of(page - 1, size, Sort.by(Sort.Direction.DESC, "createdAt"));
        Page<PointHistory> historyPage = pointHistoryRepository.findByUserId(user.getId(), pageable);
        
        List<PointHistoryResponse> data = historyPage.getContent().stream()
                .map(history -> PointHistoryResponse.builder()
                        .id(history.getId())
                        .pointsChanged(history.getPointsChanged())
                        .reason(history.getReason())
                        .referenceId(history.getReferenceId())
                        .createdAt(history.getCreatedAt())
                        .build())
                .toList();

        return PageResponse.<PointHistoryResponse>builder()
                .page(page)
                .pageSize(size)
                .totalPages(historyPage.getTotalPages())
                .totalItems(historyPage.getTotalElements())
                .data(data)
                .build();
    }
}
