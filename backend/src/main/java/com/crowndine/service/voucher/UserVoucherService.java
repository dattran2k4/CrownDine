package com.crowndine.service.voucher;

import com.crowndine.dto.request.VoucherAssignUsersRequest;
import com.crowndine.dto.response.MyVoucherResponse;
import com.crowndine.dto.response.VoucherAssignmentResponse;

import java.util.List;

public interface UserVoucherService {
    List<VoucherAssignmentResponse> assignUsers(Long voucherId, VoucherAssignUsersRequest request);

    List<VoucherAssignmentResponse> getVoucherAssignments(Long voucherId);

    List<MyVoucherResponse> getMyAvailableVouchers(String username);
}
