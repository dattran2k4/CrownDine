package com.crowndine.service.impl.order;

import com.crowndine.model.Order;
import com.crowndine.model.OrderDetail;
import com.crowndine.repository.OrderDetailRepository;
import com.crowndine.repository.OrderRepository;
import com.crowndine.service.order.OrderDetailService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j(topic = "ORDER-DETAIL-SERVICE")
public class OrderDetailServiceImpl implements OrderDetailService {

    private final OrderDetailRepository orderDetailRepository;

    @Override
    public List<OrderDetail> getOrderDetailByOrderId(Long id) {
        return orderDetailRepository.findByOrder_Id(id);
    }
}
