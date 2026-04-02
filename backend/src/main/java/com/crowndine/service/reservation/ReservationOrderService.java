package com.crowndine.service.reservation;

import com.crowndine.dto.request.OrderItemRemoveRequest;
import com.crowndine.dto.request.OrderItemRequest;
import com.crowndine.dto.response.ReservationCheckoutResponse;

public interface ReservationOrderService {
    ReservationCheckoutResponse getReservationCheckout(Long reservationId);

    ReservationCheckoutResponse addItemToReservationOrder(Long reservationId, OrderItemRequest request, String username);

    ReservationCheckoutResponse updateReservationOrderItem(Long reservationId, OrderItemRequest request, String username);

    ReservationCheckoutResponse removeReservationOrderItem(Long reservationId, OrderItemRemoveRequest request, String username);
}
