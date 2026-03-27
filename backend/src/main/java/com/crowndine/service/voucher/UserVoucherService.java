package com.crowndine.service.voucher;

import com.crowndine.dto.request.VoucherAssignUsersRequest;
import com.crowndine.dto.response.MyVoucherResponse;
import com.crowndine.dto.response.VoucherAssignmentResponse;
import com.crowndine.model.Voucher;

import java.util.List;

public interface UserVoucherService {
    List<VoucherAssignmentResponse> assignUsers(Long voucherId, VoucherAssignUsersRequest request);

    List<VoucherAssignmentResponse> getVoucherAssignments(Long voucherId);

    List<MyVoucherResponse> getMyAvailableVouchers(String username);

    List<MyVoucherResponse> getAvailableVouchersByCustomerId(Long customerId);

    Voucher consumeVoucher(String code, String username);

    void releaseVoucher(String code, String username);
}
