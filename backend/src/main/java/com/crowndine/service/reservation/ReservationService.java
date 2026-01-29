package com.crowndine.service.reservation;

import com.crowndine.dto.response.OrderDetailPageResponse;
import com.crowndine.dto.response.PageResponse;
import com.crowndine.dto.response.ReservationHistoryResponse;
import org.springframework.data.domain.Pageable;

public interface ReservationService {
    PageResponse<ReservationHistoryResponse> getReservationHistory(String username, Pageable pageable);
    OrderDetailPageResponse getReservationOrderDetails(Long reservationId, Pageable pageable);
}