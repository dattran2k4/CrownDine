package com.crowndine.service.user;

import com.crowndine.dto.response.PageResponse;
import com.crowndine.dto.response.PointHistoryResponse;

public interface RewardPointService {
    void addPointsFromOrder(Long orderId);
    void exchangeVoucher(Long voucherId, String username);
    PageResponse<PointHistoryResponse> getMyPointHistory(String username, int page, int size);
}
