package com.crowndine.service.order;

import com.crowndine.common.enums.EOrderStatus;
import com.crowndine.dto.response.UpdateStatusOrderResponse;
import com.crowndine.model.Order;

public interface OrderStatusService {

    UpdateStatusOrderResponse updateOrderStatus(Long orderId, EOrderStatus status);

    UpdateStatusOrderResponse updateOrderStatus(Long orderId, EOrderStatus status, String cancelReason);

    Order transitionOrderStatus(Order order, EOrderStatus status);

    Order transitionOrderStatus(Order order, EOrderStatus status, String cancelReason);
}
