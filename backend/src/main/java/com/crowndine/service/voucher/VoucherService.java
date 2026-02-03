package com.crowndine.service.voucher;

import com.crowndine.model.User;
import com.crowndine.model.Voucher;

public interface VoucherService {

    Voucher getVoucherByCode(String code);

    Voucher getVoucherByCodeAndUser(String code, User user);
}
