package com.crowndine.service.impl.voucher;

import com.crowndine.dto.request.VoucherAssignUsersRequest;
import com.crowndine.dto.response.MyVoucherResponse;
import com.crowndine.dto.response.VoucherAssignmentResponse;
import com.crowndine.exception.InvalidDataException;
import com.crowndine.exception.ResourceNotFoundException;
import com.crowndine.model.User;
import com.crowndine.model.UserVoucher;
import com.crowndine.model.Voucher;
import com.crowndine.repository.UserRepository;
import com.crowndine.repository.UserVoucherRepository;
import com.crowndine.repository.VoucherRepository;
import com.crowndine.service.voucher.UserVoucherService;
import com.crowndine.service.voucher.event.VoucherGrantedEvent;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j(topic = "USER-VOUCHER-SERVICE")
public class UserVoucherServiceImpl implements UserVoucherService {

    private final UserRepository userRepository;
    private final UserVoucherRepository userVoucherRepository;
    private final VoucherRepository voucherRepository;
    private final ApplicationEventPublisher eventPublisher;

    @Override
    @Transactional(rollbackFor = Exception.class)
    public List<VoucherAssignmentResponse> assignUsers(Long voucherId, VoucherAssignUsersRequest request) {
        Voucher voucher = getVoucher(voucherId);
        Set<Long> newlyAssignedUserIds = new HashSet<>();

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
                if (isNewAssignment || userVoucher.getUsageLimit() == null) {
                    userVoucher.setUsageLimit(request.getUsageLimit());
                } else {
                    userVoucher.setUsageLimit(userVoucher.getUsageLimit() + request.getUsageLimit());
                }
            } else if (isNewAssignment || userVoucher.getUsageLimit() == null) {
                userVoucher.setUsageLimit(1);
            } else {
                userVoucher.setUsageLimit(userVoucher.getUsageLimit() + 1);
            }

            if (request.getExpiredAt() != null || isNewAssignment) {
                userVoucher.setExpiredAt(request.getExpiredAt());
            }

            if (isNewAssignment) {
                userVoucher.setUsageCount(0);
                userVoucher.setAssignedAt(LocalDateTime.now());
                newlyAssignedUserIds.add(user.getId());
            }

            return userVoucher;
        }).toList();

        List<UserVoucher> savedAssignments = userVoucherRepository.saveAll(assignments);

        savedAssignments.stream()
                .filter(userVoucher -> userVoucher.getCustomer() != null && newlyAssignedUserIds.contains(userVoucher.getCustomer().getId()))
                .map(UserVoucher::getId)
                .forEach(userVoucherId -> eventPublisher.publishEvent(new VoucherGrantedEvent(userVoucherId)));

        return savedAssignments.stream().map(this::toAssignmentResponse).toList();
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
        User user = userRepository.findByUsername(username).orElseThrow(() -> new ResourceNotFoundException("user.not_found"));

        return userVoucherRepository.findAvailableByCustomerId(user.getId(), LocalDateTime.now())
                .stream()
                .map(this::toMyVoucherResponse)
                .toList();
    }

    @Override
    public List<MyVoucherResponse> getAvailableVouchersByCustomerId(Long customerId) {
        User user = userRepository.findById(customerId).orElseThrow(() -> new ResourceNotFoundException("user.not_found"));

        return userVoucherRepository.findAvailableByCustomerId(user.getId(), LocalDateTime.now())
                .stream()
                .map(this::toMyVoucherResponse)
                .toList();
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public Voucher consumeVoucher(String code, String username) {
        String normalizedCode = code.trim().toUpperCase(Locale.ROOT);
        Voucher voucher = voucherRepository.findByCode(normalizedCode).orElseThrow(() -> new InvalidDataException("voucher.invalid_code"));

        boolean isPersonal = !voucher.getUserVouchers().isEmpty();

        if (isPersonal) {
            if (username == null) {
                throw new InvalidDataException("order.voucher.personal_requires_customer_for_payment");
            }
            User user = userRepository.findByUsername(username).orElseThrow(() -> new ResourceNotFoundException("user.not_found"));

            UserVoucher userVoucher = userVoucherRepository.findByVoucher_IdAndCustomer_Id(voucher.getId(), user.getId())
                    .orElseThrow(() -> new InvalidDataException("voucher.not_assigned_to_user"));
            validateUserVoucherAvailability(userVoucher);

            int usageCount = userVoucher.getUsageCount() == null ? 0 : userVoucher.getUsageCount();
            userVoucher.setUsageCount(usageCount + 1);
            userVoucherRepository.save(userVoucher);
        }

        return voucher;
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public void releaseVoucher(String code, String username) {
        String normalizedCode = code.trim().toUpperCase(Locale.ROOT);
        Voucher voucher = voucherRepository.findByCode(normalizedCode).orElse(null);
        if (voucher == null) {
            return;
        }

        boolean isPersonal = !voucher.getUserVouchers().isEmpty();

        if (isPersonal && username != null) {
            java.util.Optional<User> userOpt = userRepository.findByUsername(username);
            if (userOpt.isPresent()) {
                java.util.Optional<UserVoucher> uvOpt = userVoucherRepository.findByVoucher_IdAndCustomer_Id(voucher.getId(), userOpt.get().getId());
                if (uvOpt.isPresent()) {
                    UserVoucher userVoucher = uvOpt.get();
                    int usageCount = userVoucher.getUsageCount() == null ? 0 : userVoucher.getUsageCount();
                    if (usageCount > 0) {
                        userVoucher.setUsageCount(usageCount - 1);
                        userVoucherRepository.save(userVoucher);
                        log.info("voucher code {} has been released, usage count {}", code, userVoucher.getUsageCount());
                    }
                }
            }
        }
    }

    private Voucher getVoucher(Long id) {
        return voucherRepository.findById(id).orElseThrow(() -> new ResourceNotFoundException("Voucher not found"));
    }

    private void validateUserVoucherAvailability(UserVoucher userVoucher) {
        if (userVoucher.getExpiredAt() != null && !userVoucher.getExpiredAt().isAfter(LocalDateTime.now())) {
            throw new InvalidDataException("voucher.expired");
        }

        int usageCount = userVoucher.getUsageCount() == null ? 0 : userVoucher.getUsageCount();
        Integer usageLimit = userVoucher.getUsageLimit();
        if (usageLimit != null && usageCount >= usageLimit) {
            throw new InvalidDataException("voucher.usage_exhausted");
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
                .minValue(voucher != null ? voucher.getMinValue() : null)
                .description(voucher != null ? voucher.getDescription() : null)
                .usageCount(userVoucher.getUsageCount())
                .usageLimit(userVoucher.getUsageLimit())
                .assignedAt(userVoucher.getAssignedAt())
                .expiredAt(userVoucher.getExpiredAt())
                .build();
    }
}
