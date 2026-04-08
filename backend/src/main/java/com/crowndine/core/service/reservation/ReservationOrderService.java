package com.crowndine.core.service.reservation;

import com.crowndine.presentation.dto.request.OrderItemRemoveRequest;
import com.crowndine.presentation.dto.request.OrderItemRequest;
import com.crowndine.presentation.dto.response.ReservationCheckoutResponse;

public interface ReservationOrderService {
    ReservationCheckoutResponse getReservationCheckout(Long reservationId);

    ReservationCheckoutResponse addItemToReservationOrder(Long reservationId, OrderItemRequest request, String username);

    ReservationCheckoutResponse updateReservationOrderItem(Long reservationId, OrderItemRequest request, String username);

    ReservationCheckoutResponse removeReservationOrderItem(Long reservationId, OrderItemRemoveRequest request, String username);
}
