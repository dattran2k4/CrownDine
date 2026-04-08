package com.crowndine.core.service.impl.voucher;

import com.crowndine.presentation.exception.InvalidDataException;
import com.crowndine.core.entity.UserVoucher;
import com.crowndine.core.service.voucher.UserVoucherValidator;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

@Service
public class UserVoucherValidatorImpl implements UserVoucherValidator {

    @Override
    public void validateAvailability(UserVoucher userVoucher) {
        if (userVoucher.getExpiredAt() != null && !userVoucher.getExpiredAt().isAfter(LocalDateTime.now())) {
            throw new InvalidDataException("voucher.expired");
        }

        int usageCount = userVoucher.getUsageCount() == null ? 0 : userVoucher.getUsageCount();
        Integer usageLimit = userVoucher.getUsageLimit();
        if (usageLimit != null && usageCount >= usageLimit) {
            throw new InvalidDataException("voucher.usage_exhausted");
        }
    }
}
