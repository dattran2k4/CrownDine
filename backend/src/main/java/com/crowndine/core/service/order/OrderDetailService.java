package com.crowndine.core.service.order;

import com.crowndine.common.enums.EOrderDetailStatus;
import com.crowndine.presentation.dto.request.OrderItemRequest;
import com.crowndine.presentation.dto.request.UpdateOrderDetailRequest;
import com.crowndine.presentation.dto.response.UpdateStatusOrderDetailResponse;
import com.crowndine.core.entity.Order;

import java.util.List;

public interface OrderDetailService {

    void createPendingOrderDetails(Order order, List<OrderItemRequest> request);

    void updateOrderDetail(Long id, UpdateOrderDetailRequest request);

    void deleteOrderDetail(Long id);

    UpdateStatusOrderDetailResponse changeStatus(Long id, EOrderDetailStatus status);
}
