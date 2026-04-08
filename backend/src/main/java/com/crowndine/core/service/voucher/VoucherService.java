package com.crowndine.core.service.voucher;

import com.crowndine.common.enums.EVoucherType;
import com.crowndine.presentation.dto.request.VoucherRequest;
import com.crowndine.presentation.dto.response.PageResponse;
import com.crowndine.presentation.dto.response.VoucherResponse;
import com.crowndine.core.entity.Voucher;

public interface VoucherService {
    VoucherResponse createVoucher(VoucherRequest request);

    PageResponse<VoucherResponse> getVouchers(String search, EVoucherType type, int page, int size);

    VoucherResponse getVoucherById(Long id);

    Voucher getVoucherByCode(String code);

    VoucherResponse updateVoucher(Long id, VoucherRequest request);
}
