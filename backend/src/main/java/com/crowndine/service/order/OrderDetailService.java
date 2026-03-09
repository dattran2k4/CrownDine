package com.crowndine.service.order;

import com.crowndine.common.enums.EOrderDetailStatus;
import com.crowndine.dto.request.OrderItemRequest;
import com.crowndine.dto.request.UpdateOrderDetailRequest;
import com.crowndine.model.Order;

import java.util.List;

public interface OrderDetailService {

    void addOrderDetailsForOrder(Order order, List<OrderItemRequest> request);

    void updateOrderDetail(Long id, UpdateOrderDetailRequest request);

    void deleteOrderDetail(Long id);

    void changeStatus(Long id, EOrderDetailStatus status);
}
