package com.crowndine.service.voucher;

import com.crowndine.common.enums.EVoucherType;
import com.crowndine.dto.request.VoucherRequest;
import com.crowndine.dto.response.PageResponse;
import com.crowndine.dto.response.VoucherResponse;
import com.crowndine.model.Voucher;

public interface VoucherService {
    VoucherResponse createVoucher(VoucherRequest request);

    PageResponse<VoucherResponse> getVouchers(String search, EVoucherType type, int page, int size);

    VoucherResponse getVoucherById(Long id);

    Voucher getVoucherByCode(String code);

    VoucherResponse updateVoucher(Long id, VoucherRequest request);
}
