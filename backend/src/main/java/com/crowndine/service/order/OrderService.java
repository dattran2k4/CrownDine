package com.crowndine.service.order;

import com.crowndine.common.enums.EOrderStatus;
import com.crowndine.dto.request.OrderItemRequest;
import com.crowndine.dto.request.OrderRequest;
import com.crowndine.dto.response.OrderResponse;
import com.crowndine.model.Order;

import java.util.List;

public interface OrderService {
    Order getOrderByCode(String code);

    void createOder(OrderRequest request, String username);

    void updateStatus(Long id, EOrderStatus status);

    void deleteOrder(Long id);

    Order getOrderById(Long id);

    List<OrderResponse> getOrderByUsername(String username);
}
