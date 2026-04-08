package com.crowndine.core.service.order;

import com.crowndine.common.enums.EOrderStatus;
import com.crowndine.presentation.dto.request.OrderItemBatchRequest;
import com.crowndine.presentation.dto.request.OrderItemRemoveRequest;
import com.crowndine.presentation.dto.request.OrderItemRequest;
import com.crowndine.presentation.dto.request.OrderRequest;
import com.crowndine.presentation.dto.response.OrderResponse;
import com.crowndine.presentation.dto.response.PageResponse;
import com.crowndine.core.entity.Order;
import com.crowndine.core.entity.Reservation;
import com.crowndine.core.entity.User;

import java.time.LocalDate;
import java.util.List;

public interface OrderService {
    Order getOrderByCode(String code);

    Order createOrderForReservation(Reservation reservation, User user, EOrderStatus initialStatus);

    Order confirmReservationOrder(Order order);

    void addOrUpdateItemToOrder(Long orderId, OrderItemRequest request);

    void updateOrderItemInReservation(Order order, OrderItemRequest request);

    void removeOrderItemInReservation(Order order, OrderItemRemoveRequest request);

    PageResponse<OrderResponse> getAllOrders(LocalDate fromDate, LocalDate toDate, EOrderStatus status, int page,
                                             int size);

    void createWalkInOrder(OrderRequest request, String username);

    OrderResponse openOrderForReservation(Long reservationId, OrderItemBatchRequest request, String username);

    void appendItemsToOrder(Long id, OrderItemBatchRequest request, String name);

    void mapCustomerToOrder(Long orderId, Long customerId);

    Order getOrder(Long id);

    List<OrderResponse> getKitchenOrders();
}
