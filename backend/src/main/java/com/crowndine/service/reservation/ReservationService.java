package com.crowndine.service.reservation;

import com.crowndine.dto.response.OrderDetailPageResponse;
import com.crowndine.dto.response.PageResponse;
import com.crowndine.dto.response.ReservationHistoryResponse;
public interface ReservationService {
    PageResponse<ReservationHistoryResponse> getReservationHistory(String username, int page, int size);
    OrderDetailPageResponse getReservationOrderDetails(Long reservationId);
}