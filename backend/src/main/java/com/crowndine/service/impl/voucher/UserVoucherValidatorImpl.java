package com.crowndine.service.impl.voucher;

import com.crowndine.exception.InvalidDataException;
import com.crowndine.model.UserVoucher;
import com.crowndine.service.voucher.UserVoucherValidator;
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
