package com.crowndine.service.reservation;

import com.crowndine.dto.request.OrderItemRemoveRequest;
import com.crowndine.dto.request.OrderItemRequest;
import com.crowndine.dto.response.OrderDetailHistoryResponse;

public interface ReservationOrderService {
    OrderDetailHistoryResponse getReservationOrderDetails(Long reservationId);

    void addItemToReservationOrder(Long reservationId, OrderItemRequest request, String username);

    void updateReservationOrderItem(Long reservationId, OrderItemRequest request, String username);

    void removeReservationOrderItem(Long reservationId, OrderItemRemoveRequest request, String username);
}
