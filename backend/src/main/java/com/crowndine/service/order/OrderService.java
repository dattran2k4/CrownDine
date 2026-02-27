package com.crowndine.service.order;

import com.crowndine.dto.request.OrderItemBatchRequest;
import com.crowndine.dto.request.OrderItemRemoveRequest;
import com.crowndine.dto.request.OrderItemRequest;
import com.crowndine.model.Order;
import com.crowndine.model.Reservation;
import com.crowndine.model.User;

public interface OrderService {
    Order getOrderByCode(String code);

    void addOrderForReservation(Reservation res, OrderItemBatchRequest request, User user);

    Order createOrderForReservation(Reservation reservation, User user);

    void addOrUpdateItemToOrder(Long orderId, OrderItemRequest requestt);

    void updateOrderItemInReservation(Order order, OrderItemRequest request);

    void removeOrderItemInReservation(Order order, OrderItemRemoveRequest request);
}
