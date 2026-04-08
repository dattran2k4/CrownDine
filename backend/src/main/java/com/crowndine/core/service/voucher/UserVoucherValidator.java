package com.crowndine.core.service.voucher;

import com.crowndine.core.entity.UserVoucher;

public interface UserVoucherValidator {
    void validateAvailability(UserVoucher userVoucher);
}
