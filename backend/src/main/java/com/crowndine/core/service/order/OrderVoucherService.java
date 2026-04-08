package com.crowndine.core.service.order;

import com.crowndine.presentation.dto.response.VoucherValidateResponse;
import com.crowndine.presentation.dto.response.OrderApplyVoucherResponse;

public interface OrderVoucherService {

    VoucherValidateResponse validateVoucherForOrder(Long orderId, String code, String username);

    OrderApplyVoucherResponse applyVoucher(Long orderId, String code, String username);

    OrderApplyVoucherResponse removeVoucher(Long orderId, String username);
}
