package com.crowndine.service.voucher;

import com.crowndine.model.UserVoucher;

public interface UserVoucherValidator {
    void validateAvailability(UserVoucher userVoucher);
}
