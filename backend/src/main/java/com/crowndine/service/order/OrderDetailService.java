package com.crowndine.service.order;

import com.crowndine.dto.request.OrderItemBatchRequest;
import com.crowndine.dto.request.UpdateOrderDetailRequest;
import com.crowndine.model.Order;

public interface OrderDetailService {

    void addOrderDetailForOrder(Order order, OrderItemBatchRequest request);

    void updateOrderDetail(Long id, UpdateOrderDetailRequest request);

    void deleteOrderDetail(Long id);
}
