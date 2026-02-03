package com.crowndine.service.order;

import com.crowndine.model.Order;
import com.crowndine.model.OrderDetail;

import java.util.List;

public interface OrderDetailService {

    List<OrderDetail> getOrderDetailByOrderId(Long id);
}
