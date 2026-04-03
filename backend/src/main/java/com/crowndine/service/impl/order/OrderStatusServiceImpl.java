package com.crowndine.service.impl.order;

import com.crowndine.common.enums.EOrderStatus;
import com.crowndine.dto.response.UpdateStatusOrderResponse;
import com.crowndine.exception.ResourceNotFoundException;
import com.crowndine.model.Order;
import com.crowndine.repository.OrderRepository;
import com.crowndine.service.layout.RestaurantTableStateService;
import com.crowndine.service.order.OrderStatusService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Slf4j(topic = "ORDER-STATUS-SERVICE")
public class OrderStatusServiceImpl implements OrderStatusService {

    private static final String ORDER_NOT_FOUND_MESSAGE = "Order not found";

    private final OrderRepository orderRepository;
    private final RestaurantTableStateService restaurantTableStateService;
    private final SimpMessagingTemplate messagingTemplate;

    @Override
    @Transactional(rollbackFor = Exception.class)
    public UpdateStatusOrderResponse updateOrderStatus(Long orderId, EOrderStatus status) {
        return updateOrderStatus(orderId, status, null);
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public UpdateStatusOrderResponse updateOrderStatus(Long orderId, EOrderStatus status, String cancelReason) {
        Order order = orderRepository.findById(orderId).orElseThrow(() -> new ResourceNotFoundException(ORDER_NOT_FOUND_MESSAGE));
        Order updatedOrder = transitionOrderStatus(order, status, cancelReason);
        return buildStatusResponse(updatedOrder);
    }

    @Override
    public Order transitionOrderStatus(Order order, EOrderStatus status) {
        return transitionOrderStatus(order, status, null);
    }

    @Override
    public Order transitionOrderStatus(Order order, EOrderStatus status, String cancelReason) {
        order.setStatus(status);
        if (status == EOrderStatus.CANCELLED && cancelReason != null) {
            order.setCancelReason(cancelReason);
        }
        Order updatedOrder = orderRepository.save(order);
        handleOrderStatusSideEffects(updatedOrder);
        publishOrderStatus(updatedOrder);
        return updatedOrder;
    }

    private void handleOrderStatusSideEffects(Order order) {
        if (order.getRestaurantTable() == null) {
            return;
        }

        Long tableId = order.getRestaurantTable().getId();
        switch (order.getStatus()) {
            case CONFIRMED, IN_PROGRESS -> restaurantTableStateService.markOccupied(tableId);
            case COMPLETED, CANCELLED -> restaurantTableStateService.markAvailable(tableId);
            case PRE_ORDER, SERVED -> {
                // PRE_ORDER reserve is handled by reservation scheduler; SERVED keeps current table state.
            }
        }
    }

    private void publishOrderStatus(Order order) {
        messagingTemplate.convertAndSend("/topic/orders", buildStatusResponse(order));
    }

    private UpdateStatusOrderResponse buildStatusResponse(Order order) {
        UpdateStatusOrderResponse response = new UpdateStatusOrderResponse();
        response.setId(order.getId());
        response.setStatus(order.getStatus());
        return response;
    }
}
