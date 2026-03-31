package com.crowndine.service.order;

import com.crowndine.model.Order;

public interface OrderPaymentService {

    void markOrderAsPaid(Order order);
}
