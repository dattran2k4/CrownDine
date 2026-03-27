package com.crowndine.service.order;

import com.crowndine.dto.response.VoucherValidateResponse;
import com.crowndine.dto.response.OrderApplyVoucherResponse;

public interface OrderVoucherService {

    VoucherValidateResponse validateVoucherForOrder(Long orderId, String code, String username);

    OrderApplyVoucherResponse applyVoucher(Long orderId, String code, String username);

    OrderApplyVoucherResponse removeVoucher(Long orderId, String username);
}
