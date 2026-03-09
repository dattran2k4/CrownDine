package com.crowndine.service.impl.voucher;

import com.crowndine.dto.request.VoucherAssignUsersRequest;
import com.crowndine.dto.response.MyVoucherResponse;
import com.crowndine.dto.response.VoucherAssignmentResponse;
import com.crowndine.exception.ResourceNotFoundException;
import com.crowndine.model.User;
import com.crowndine.model.UserVoucher;
import com.crowndine.model.Voucher;
import com.crowndine.repository.UserRepository;
import com.crowndine.repository.UserVoucherRepository;
import com.crowndine.repository.VoucherRepository;
import com.crowndine.service.voucher.UserVoucherService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j(topic = "USER-VOUCHER-SERVICE")
public class UserVoucherServiceImpl implements UserVoucherService {

    private final UserRepository userRepository;
    private final UserVoucherRepository userVoucherRepository;
    private final VoucherRepository voucherRepository;

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

    private Voucher getVoucher(Long id) {
        return voucherRepository.findById(id).orElseThrow(() -> new ResourceNotFoundException("Voucher not found"));
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
