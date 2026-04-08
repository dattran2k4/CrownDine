package com.crowndine.core.service.user;

import com.crowndine.presentation.dto.response.PageResponse;
import com.crowndine.presentation.dto.response.PointHistoryResponse;

public interface RewardPointService {
    void addPointsFromOrder(Long orderId);
    void exchangeVoucher(Long voucherId, String username);
    PageResponse<PointHistoryResponse> getMyPointHistory(String username, int page, int size);
}
