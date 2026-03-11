package com.crowndine.service.impl.voucher;

import com.crowndine.common.enums.EOrderStatus;
import com.crowndine.dto.request.VoucherAssignUsersRequest;
import com.crowndine.dto.response.MyVoucherResponse;
import com.crowndine.dto.response.VoucherAssignmentResponse;
import com.crowndine.dto.response.VoucherValidateResponse;
import com.crowndine.exception.InvalidDataException;
import com.crowndine.exception.ResourceNotFoundException;
import com.crowndine.model.Order;
import com.crowndine.model.User;
import com.crowndine.model.UserVoucher;
import com.crowndine.model.Voucher;
import com.crowndine.repository.OrderRepository;
import com.crowndine.repository.UserRepository;
import com.crowndine.repository.UserVoucherRepository;
import com.crowndine.repository.VoucherRepository;
import com.crowndine.service.CalculationService;
import com.crowndine.service.voucher.UserVoucherService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Locale;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j(topic = "USER-VOUCHER-SERVICE")
public class UserVoucherServiceImpl implements UserVoucherService {

    private final UserRepository userRepository;
    private final UserVoucherRepository userVoucherRepository;
    private final VoucherRepository voucherRepository;
    private final OrderRepository orderRepository;
    private final CalculationService calculationService;

    @Override
    @Transactional(rollbackFor = Exception.class)
    public List<VoucherAssignmentResponse> assignUsers(Long voucherId, VoucherAssignUsersRequest request) {
        Voucher voucher = getVoucher(voucherId);

        Set<Long> uniqueUserIds = new LinkedHashSet<>(request.getUserIds());
        List<User> users = userRepository.findAllById(uniqueUserIds);

        if (users.size() != uniqueUserIds.size()) {
            Set<Long> foundIds = users.stream().map(User::getId).collect(Collectors.toSet());
            List<Long> missingUserIds = uniqueUserIds.stream()
                    .filter(userId -> !foundIds.contains(userId))
                    .toList();
            throw new ResourceNotFoundException("User not found with ids: " + missingUserIds);
        }

        List<UserVoucher> assignments = users.stream().map(user -> {
            UserVoucher userVoucher = userVoucherRepository
                    .findByVoucher_IdAndCustomer_Id(voucherId, user.getId())
                    .orElseGet(UserVoucher::new);

            boolean isNewAssignment = userVoucher.getId() == null;
            userVoucher.setVoucher(voucher);
            userVoucher.setCustomer(user);

            if (request.getUsageLimit() != null) {
                userVoucher.setUsageLimit(request.getUsageLimit());
            } else if (isNewAssignment || userVoucher.getUsageLimit() == null) {
                userVoucher.setUsageLimit(1);
            }

            if (request.getExpiredAt() != null || isNewAssignment) {
                userVoucher.setExpiredAt(request.getExpiredAt());
            }

            if (isNewAssignment) {
                userVoucher.setUsageCount(0);
                userVoucher.setAssignedAt(LocalDateTime.now());
            }

            return userVoucher;
        }).toList();

        return userVoucherRepository.saveAll(assignments).stream()
                .map(this::toAssignmentResponse)
                .toList();
    }

    @Override
    public List<VoucherAssignmentResponse> getVoucherAssignments(Long voucherId) {
        getVoucher(voucherId);
        return userVoucherRepository.findAssignmentsByVoucherId(voucherId)
                .stream()
                .map(this::toAssignmentResponse)
                .toList();
    }

    @Override
    public List<MyVoucherResponse> getMyAvailableVouchers(String username) {
        User user = userRepository.findByUsername(username).orElseThrow(() -> new ResourceNotFoundException("User not found"));

        return userVoucherRepository.findAvailableByCustomerId(user.getId(), LocalDateTime.now())
                .stream()
                .map(this::toMyVoucherResponse)
                .toList();
    }

    @Override
    public VoucherValidateResponse validateVoucher(String code, Long orderId, String username) {
        Order order = orderRepository.findById(orderId).orElseThrow(() -> new ResourceNotFoundException("Order not found"));

        if (!order.getUser().getUsername().equals(username)) {
            throw new InvalidDataException("Đơn hàng này không phải của user");
        }

        if (order.getStatus() == EOrderStatus.COMPLETED || order.getStatus() == EOrderStatus.CANCELLED) {
            throw new InvalidDataException("Không thể áp voucher cho đơn đã hoàn tất hoặc đã hủy");
        }

        if (order.getOrderDetails().isEmpty()) {
            throw new InvalidDataException("Đơn hàng chưa có món để áp voucher");
        }

        BigDecimal totalOrder = calculationService.calculateTotalOrder(order.getOrderDetails());
        if (totalOrder.compareTo(BigDecimal.ZERO) <= 0) {
            throw new InvalidDataException("Tổng tiền đơn hàng phải lớn hơn 0 để áp voucher");
        }

        UserVoucher userVoucher = getValidUserVoucher(code, username);
        Voucher voucher = userVoucher.getVoucher();

        BigDecimal discountAmount = calculationService.calculateVoucherDiscount(totalOrder, voucher);
        BigDecimal finalAmount = calculationService.calculateFinalTotalPrice(totalOrder, discountAmount);

        return VoucherValidateResponse.builder()
                .voucherId(voucher.getId())
                .code(voucher.getCode())
                .name(voucher.getName())
                .type(voucher.getType())
                .orderAmount(totalOrder)
                .discountAmount(discountAmount)
                .finalAmount(finalAmount)
                .usageCount(userVoucher.getUsageCount())
                .usageLimit(userVoucher.getUsageLimit())
                .build();
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public Voucher consumeVoucher(String code, String username) {
        UserVoucher userVoucher = getValidUserVoucher(code, username);
        int usageCount = userVoucher.getUsageCount() == null ? 0 : userVoucher.getUsageCount();
        userVoucher.setUsageCount(usageCount + 1);
        userVoucherRepository.save(userVoucher);
        return userVoucher.getVoucher();
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public void releaseVoucher(String code, String username) {
        UserVoucher userVoucher = getUserVoucher(code, username);
        
        int usageCount = userVoucher.getUsageCount();
        if (usageCount < 1) {
            return;
        }
        userVoucher.setUsageCount(usageCount - 1);
        userVoucherRepository.save(userVoucher);
        log.info("voucher code {} has been released, usage count {}", code, userVoucher.getUsageCount());
    }

    private Voucher getVoucher(Long id) {
        return voucherRepository.findById(id).orElseThrow(() -> new ResourceNotFoundException("Voucher not found"));
    }

    private UserVoucher getUserVoucher(String code, String username) {
        User user = userRepository.findByUsername(username).orElseThrow(() -> new ResourceNotFoundException("User not found"));

        String normalizedCode = code.trim().toUpperCase(Locale.ROOT);
        Voucher voucher = voucherRepository.findByCode(normalizedCode).orElseThrow(() -> new InvalidDataException("Mã voucher không hợp lệ"));

        return userVoucherRepository.findByVoucher_IdAndCustomer_Id(voucher.getId(), user.getId()).orElseThrow(() -> new InvalidDataException("Voucher chưa được gán cho người dùng"));
    }

    private UserVoucher getValidUserVoucher(String code, String username) {
        UserVoucher userVoucher = getUserVoucher(code, username);

        validateUserVoucherAvailability(userVoucher);
        return userVoucher;
    }

    private void validateUserVoucherAvailability(UserVoucher userVoucher) {
        if (userVoucher.getExpiredAt() != null && !userVoucher.getExpiredAt().isAfter(LocalDateTime.now())) {
            throw new InvalidDataException("Voucher đã hết hạn");
        }

        int usageCount = userVoucher.getUsageCount() == null ? 0 : userVoucher.getUsageCount();
        Integer usageLimit = userVoucher.getUsageLimit();
        if (usageLimit != null && usageCount >= usageLimit) {
            throw new InvalidDataException("Voucher đã hết lượt sử dụng");
        }
    }

    private VoucherAssignmentResponse toAssignmentResponse(UserVoucher userVoucher) {
        User customer = userVoucher.getCustomer();
        Voucher voucher = userVoucher.getVoucher();

        return VoucherAssignmentResponse.builder()
                .assignmentId(userVoucher.getId())
                .voucherId(voucher != null ? voucher.getId() : null)
                .voucherCode(voucher != null ? voucher.getCode() : null)
                .customerId(customer != null ? customer.getId() : null)
                .username(customer != null ? customer.getUsername() : null)
                .fullName(customer != null ? customer.getFullName() : null)
                .usageCount(userVoucher.getUsageCount())
                .usageLimit(userVoucher.getUsageLimit())
                .assignedAt(userVoucher.getAssignedAt())
                .expiredAt(userVoucher.getExpiredAt())
                .build();
    }

    private MyVoucherResponse toMyVoucherResponse(UserVoucher userVoucher) {
        Voucher voucher = userVoucher.getVoucher();

        return MyVoucherResponse.builder()
                .assignmentId(userVoucher.getId())
                .voucherId(voucher != null ? voucher.getId() : null)
                .voucherCode(voucher != null ? voucher.getCode() : null)
                .voucherName(voucher != null ? voucher.getName() : null)
                .voucherType(voucher != null ? voucher.getType() : null)
                .discountValue(voucher != null ? voucher.getDiscountValue() : null)
                .maxDiscountValue(voucher != null ? voucher.getMaxDiscountValue() : null)
                .description(voucher != null ? voucher.getDescription() : null)
                .usageCount(userVoucher.getUsageCount())
                .usageLimit(userVoucher.getUsageLimit())
                .assignedAt(userVoucher.getAssignedAt())
                .expiredAt(userVoucher.getExpiredAt())
                .build();
    }
}
