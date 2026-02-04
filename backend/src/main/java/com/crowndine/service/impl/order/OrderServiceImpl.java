package com.crowndine.service.impl.order;

import com.crowndine.exception.ResourceNotFoundException;
import com.crowndine.model.Order;
import com.crowndine.repository.OrderRepository;
import com.crowndine.service.order.OrderService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
@Slf4j(topic = "ORDER-SERVICE")
public class OrderServiceImpl implements OrderService {

    private final OrderRepository orderRepository;

    @Override
    public Order getOrderByCode(String code) {
        return orderRepository.findByCode(code).orElseThrow(() -> new ResourceNotFoundException("Order not found"));
    }
}
