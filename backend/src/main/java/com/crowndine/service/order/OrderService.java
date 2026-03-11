package com.crowndine.service.order;

import com.crowndine.common.enums.EOrderStatus;
import com.crowndine.dto.request.OrderItemBatchRequest;
import com.crowndine.dto.request.OrderItemRemoveRequest;
import com.crowndine.dto.request.OrderItemRequest;
import com.crowndine.dto.request.OrderRequest;
import com.crowndine.dto.response.OrderApplyVoucherResponse;
import com.crowndine.dto.response.OrderResponse;
import com.crowndine.dto.response.PageResponse;
import com.crowndine.dto.response.UpdateStatusOrderResponse;
import com.crowndine.model.Order;
import com.crowndine.model.Reservation;
import com.crowndine.model.User;

import java.time.LocalDate;

public interface OrderService {
    Order getOrderByCode(String code);

    void addOrderForReservation(Reservation res, OrderItemBatchRequest request, User user);

    Order createOrderForReservation(Reservation reservation, User user);

    void addOrUpdateItemToOrder(Long orderId, OrderItemRequest request);

    void updateOrderItemInReservation(Order order, OrderItemRequest request);

    void removeOrderItemInReservation(Order order, OrderItemRemoveRequest request);

    PageResponse<OrderResponse> getAllOrders(LocalDate fromDate, LocalDate toDate, EOrderStatus status, int page, int size);

    UpdateStatusOrderResponse updateOrderStatus(Long id, EOrderStatus status);

    void createOrderByStaff(OrderRequest request, String username);

    void addDetailsToOrder(Long id, OrderItemBatchRequest request, String name);

    Order getOrder(Long id);

    OrderApplyVoucherResponse applyVoucherToOrder(Long orderId, String code, String username);

    OrderApplyVoucherResponse removeVoucherFromOrder(Long orderId, String username);
}
