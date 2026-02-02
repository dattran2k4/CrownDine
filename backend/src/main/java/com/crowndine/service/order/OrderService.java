package com.crowndine.service.order;

import com.crowndine.model.Order;

public interface OrderService {
    Order getOrderByCode(String code);
}
