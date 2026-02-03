package com.crowndine.service.impl.order;

import com.crowndine.common.enums.EOrderStatus;
import com.crowndine.common.utils.CodeUtils;
import com.crowndine.dto.request.OrderItemRequest;
import com.crowndine.dto.request.OrderRequest;
import com.crowndine.dto.response.OrderResponse;
import com.crowndine.exception.InvalidDataException;
import com.crowndine.exception.ResourceNotFoundException;
import com.crowndine.model.*;
import com.crowndine.repository.ItemRepository;
import com.crowndine.repository.OrderRepository;
import com.crowndine.repository.UserRepository;
import com.crowndine.service.order.OrderService;
import com.crowndine.service.voucher.VoucherService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j(topic = "ORDER-SERVICE")
public class OrderServiceImpl implements OrderService {

    private final OrderRepository orderRepository;
    private final ItemRepository itemRepository;
    private final UserRepository userRepository;
    private final VoucherService voucherService;
    private final PriceCalculatorService priceCalculatorService;

    @Override
    public Order getOrderByCode(String code) {
        return orderRepository.findByCode(code).orElseThrow(() -> new ResourceNotFoundException("Order not found"));
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public void createOder(OrderRequest request, String username) {
        log.info("Processing create order");
        Order order = new Order();

        User user = userRepository.findByUsername(username).orElseThrow(() -> new ResourceNotFoundException("User not found"));

        order.setUser(user);

        order.setStatus(EOrderStatus.PRE_ORDER);

        List<OrderDetail> orderDetails = new ArrayList<>();

        for (OrderItemRequest item : request.getItems()) {
            OrderDetail orderDetail = new OrderDetail();
            Item i = itemRepository.findById(item.getItemId()).orElseThrow(() -> new ResourceNotFoundException("Item not found"));
            orderDetail.setNote(item.getNote());
            orderDetail.setQuantity(item.getQuantity());
            orderDetail.setItem(i);
            orderDetail.setOrder(order);
            orderDetail.setTotalPrice(i.getPrice().multiply(BigDecimal.valueOf(item.getQuantity())));
            orderDetails.add(orderDetail);
        }

        order.setOrderDetails(orderDetails);

        //Set Voucher
        if (StringUtils.hasText(request.getVoucherCode())) {
            Voucher voucher = voucherService.getVoucherByCodeAndUser(request.getVoucherCode(), user);
            order.setVoucher(voucher);
        }

        //Calulate total price, discount price, final price
        priceCalculatorService.calculateTotalPrice(order);

        order.setCode(CodeUtils.generateOrderCode());

        orderRepository.save(order);
        log.info("Order created successfully");
    }

    @Override
    public void updateStatus(Long id, EOrderStatus status) {
        Order order = getOrderById(id);

        if (order.getStatus().equals(EOrderStatus.COMPLETED)) {
            throw new InvalidDataException("Order already completed");
        }

        if (order.getStatus().equals(EOrderStatus.CANCELLED)) {
            throw new InvalidDataException("Order already cancelled");
        }

        order.setStatus(status);

        orderRepository.save(order);
        log.info("Order {} updated to status {}", order.getId(), status);
    }

    @Override
    public void deleteOrder(Long id) {
        orderRepository.delete(getOrderById(id));
    }

    @Override
    public Order getOrderById(Long id) {
        return orderRepository.findById(id).orElseThrow(() -> new ResourceNotFoundException("Order not found"));
    }

    @Override
    public List<OrderResponse> getOrderByUsername(String username) {
        User user = userRepository.findByUsername(username).orElseThrow(() -> new ResourceNotFoundException("User not found"));
        return orderRepository.findByUserId(user.getId()).stream().map(this::toResponse).toList();
    }

    private OrderResponse toResponse(Order order) {
        return OrderResponse.builder()
                .id(order.getId())
                .code(order.getCode())
                .totalPrice(order.getTotalPrice())
                .discountPrice(order.getDiscountPrice())
                .finalPrice(order.getFinalPrice())
                .status(order.getStatus())
                .build();

    }
}
