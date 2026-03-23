package com.crowndine.service.order;

import com.crowndine.common.enums.EOrderStatus;
import com.crowndine.dto.request.OrderItemBatchRequest;
import com.crowndine.dto.request.OrderItemRemoveRequest;
import com.crowndine.dto.request.OrderItemRequest;
import com.crowndine.dto.request.OrderRequest;
import com.crowndine.dto.response.OrderApplyVoucherResponse;
import com.crowndine.dto.response.OrderDetailHistoryResponse;
import com.crowndine.dto.response.OrderResponse;
import com.crowndine.dto.response.PageResponse;
import com.crowndine.dto.response.UpdateStatusOrderResponse;
import com.crowndine.model.Order;
import com.crowndine.model.Reservation;
import com.crowndine.model.User;

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

    UpdateStatusOrderResponse updateOrderStatus(Long id, EOrderStatus status);

    void createWalkInOrder(OrderRequest request, String username);

    OrderResponse openOrderForReservation(Long reservationId, OrderItemBatchRequest request, String username);

    void appendItemsToOrder(Long id, OrderItemBatchRequest request, String name);

    void mapCustomerToOrder(Long orderId, Long customerId);

    Order getOrder(Long id);

    OrderApplyVoucherResponse applyVoucherToOrder(Long orderId, String code, String username);

    OrderApplyVoucherResponse removeVoucherFromOrder(Long orderId, String username);

    void markAsPaid(Order order);

    List<OrderResponse> getKitchenOrders();
}
