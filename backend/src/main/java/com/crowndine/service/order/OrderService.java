package com.crowndine.service.order;

import com.crowndine.dto.request.OrderItemBatchRequest;
import com.crowndine.model.Order;

public interface OrderService {
    Order getOrderByCode(String code);

    void addOrderForReservation(Long reservationId, OrderItemBatchRequest request, String username);

    void updateOrder(Long orderId);
}
