package com.crowndine.core.service.order;

import com.crowndine.core.entity.Order;

public interface OrderPaymentService {

    void markOrderAsPaid(Order order);
}
