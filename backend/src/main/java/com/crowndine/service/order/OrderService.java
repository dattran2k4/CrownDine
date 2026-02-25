package com.crowndine.service.order;

import com.crowndine.dto.request.OrderItemBatchRequest;
import com.crowndine.model.Order;
import com.crowndine.model.Reservation;
import com.crowndine.model.User;

public interface OrderService {
    Order getOrderByCode(String code);

    void addOrderForReservation(Reservation res, OrderItemBatchRequest request, User user);

    void updateOrder(Long orderId);
}
