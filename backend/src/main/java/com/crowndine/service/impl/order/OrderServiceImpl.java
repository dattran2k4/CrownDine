package com.crowndine.service.impl.order;

import com.crowndine.common.enums.EOrderStatus;
import com.crowndine.dto.request.OrderItemBatchRequest;
import com.crowndine.dto.request.OrderItemRemoveRequest;
import com.crowndine.dto.request.OrderItemRequest;
import com.crowndine.exception.InvalidDataException;
import com.crowndine.exception.ResourceNotFoundException;
import com.crowndine.model.*;
import com.crowndine.repository.*;
import com.crowndine.service.CalculationService;
import com.crowndine.service.order.OrderService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j(topic = "ORDER-SERVICE")
public class OrderServiceImpl implements OrderService {

    private final OrderRepository orderRepository;
    private final ItemRepository itemRepository;
    private final ComboRepository comboRepository;

    private final CalculationService calculationService;

    @Override
    public Order getOrderByCode(String code) {
        return orderRepository.findByCode(code).orElseThrow(() -> new ResourceNotFoundException("Order not found"));
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public void addOrderForReservation(Reservation reservation, OrderItemBatchRequest request, User user) {
        Order order = (reservation.getOrder() != null) ? reservation.getOrder() : new Order();

        order.setStatus(EOrderStatus.PENDING);
        order.setReservation(reservation);
        order.setUser(user);
        order.setRestaurantTable(reservation.getTable());
        order.setDiscountPrice(BigDecimal.ZERO);
        order.setTotalPrice(BigDecimal.ZERO);
        order.setFinalPrice(BigDecimal.ZERO);

        List<OrderDetail> orderDetails = new ArrayList<>();

        for (OrderItemRequest itemReq : request.getItems()) {
            boolean hasItem = itemReq.getItemId() != null;
            boolean hasCombo = itemReq.getComboId() != null;
            if (!hasItem && !hasCombo) {
                throw new InvalidDataException("Chưa có món");
            }

            OrderDetail detail = new OrderDetail();
            detail.setOrder(order);
            detail.setQuantity(itemReq.getQuantity());
            detail.setNote(itemReq.getNote());

            BigDecimal unitPrice = BigDecimal.ZERO;

            if (hasItem) {
                Item item = itemRepository.findById(itemReq.getItemId())
                        .orElseThrow(() -> new ResourceNotFoundException("Item not found"));
                detail.setItem(item);
                unitPrice = item.getPriceAfterDiscount() != null ? item.getPriceAfterDiscount() : item.getPrice();
                log.info("Adding item {} for order {}", itemReq.getItemId(), order.getId());
            }

            if (hasCombo) {
                Combo combo = comboRepository.findById(itemReq.getComboId())
                        .orElseThrow(() -> new ResourceNotFoundException("Combo not found"));
                detail.setCombo(combo);
                unitPrice = combo.getPriceAfterDiscount() != null ? combo.getPriceAfterDiscount() : combo.getPrice();
                log.info("Adding combo {} for order {}", itemReq.getComboId(), order.getId());
            }

            detail.setTotalPrice(unitPrice.multiply(BigDecimal.valueOf(itemReq.getQuantity())));

            orderDetails.add(detail);
        }
        order.setOrderDetails(orderDetails);
        order.setTotalPrice(calculationService.calculateTotalOrder(orderDetails));

        Order result = orderRepository.save(order);


        log.info("Order has been saved {}", result.getId());
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public Order createOrderForReservation(Reservation reservation, User user) {
        log.info("Creating new order for reservation {}", reservation.getId());
        Order order = new Order();
        order.setReservation(reservation);
        order.setUser(user);
        order.setRestaurantTable(reservation.getTable());
        order.setStatus(EOrderStatus.PENDING);
        order.setTotalPrice(BigDecimal.ZERO);
        order.setFinalPrice(BigDecimal.ZERO);
        order.setDiscountPrice(BigDecimal.ZERO);
        order.setCode(UUID.randomUUID().toString());

        Order result = orderRepository.save(order);

        log.info("New order has been created with id {} for reservationId {}", result.getId(), reservation.getId());
        return result;
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public void addOrUpdateItemToOrder(Long orderId, OrderItemRequest request) {
        log.info("Processing add item {} for order {}", request.getItemId(), orderId);
        Order order = orderRepository.findById(orderId).orElseThrow(() -> new ResourceNotFoundException("Order not found"));

        List<OrderDetail> orderDetails = order.getOrderDetails();

        //Check trùng orderDetails item id == request item id
        Optional<OrderDetail> existedDetail = orderDetails
                .stream()
                .filter(detail -> isSameProduct(detail, request.getItemId(), request.getComboId()))
                .findFirst();

        //Nếu có thì update quantity
        if (existedDetail.isPresent()) {
            log.info("Updating existed item {} for order {}", request.getItemId(), orderId);
            existedDetail.get().setQuantity(existedDetail.get().getQuantity() + request.getQuantity());
            existedDetail.get().setNote(request.getNote());
            existedDetail.get().calculateAndSetTotalPrice();
        }

        //Không có thì tạo mới order detail rồi order.add
        else {
            log.info("Adding new item {} for order {}", request.getItemId(), orderId);
            OrderDetail detail = new OrderDetail();
            if (request.getItemId() != null) {
                detail.setItem(itemRepository.findById(request.getItemId()).orElseThrow(() -> new ResourceNotFoundException("Item not found")));
            } else {
                detail.setCombo(comboRepository.findById(request.getComboId()).orElseThrow(() -> new ResourceNotFoundException("Combo not found")));
            }
            detail.setQuantity(request.getQuantity());
            detail.setNote(request.getNote());
            detail.setOrder(order);
            detail.calculateAndSetTotalPrice();
            orderDetails.add(detail);
        }

        BigDecimal totalPrice = calculationService.calculateTotalOrder(orderDetails);

        order.setTotalPrice(totalPrice);

        //TODO CALCULATE FINAL PRICE
        order.setFinalPrice(totalPrice);

        Order result = orderRepository.save(order);
        log.info("Order has been saved with id {}", result.getId());
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public void updateOrderItemInReservation(Order order, OrderItemRequest request) {
        log.info("Updating quantity or note for orderId {}", order.getId());

        List<OrderDetail> orderDetails = order.getOrderDetails();

        OrderDetail detailToUpdate = orderDetails.stream()
                .filter(d -> isSameProduct(d, request.getItemId(), request.getComboId()))
                .findFirst()
                .orElseThrow(() -> new ResourceNotFoundException("Sản phẩm này chưa có trong đơn hàng"));

        log.info("Updating quantity or note for detailId {}", detailToUpdate.getId());

        detailToUpdate.setQuantity(request.getQuantity());
        detailToUpdate.setNote(request.getNote());
        detailToUpdate.calculateAndSetTotalPrice();

        order.setTotalPrice(calculationService.calculateTotalOrder(orderDetails));

        //TODO CALCULATE FINAL PRICE
        order.setFinalPrice(calculationService.calculateTotalOrder(orderDetails));

        orderRepository.save(order);
        log.info("Updating quantity or note for detailId successfully for detailId {}", detailToUpdate.getId());
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public void removeOrderItemInReservation(Order order, OrderItemRemoveRequest request) {
        log.info("Removing order item  for order {}", order.getId());

        boolean removed = order.getOrderDetails().removeIf(detail -> isSameProduct(detail, request.getItemId(), request.getComboId()));

        if (!removed) {
            throw new ResourceNotFoundException("Sản phẩm này không tồn tại trong đơn hàng để xóa");
        }

        log.info("Item removed successfully from order list");

        BigDecimal newTotalPrice = calculationService.calculateTotalOrder(order.getOrderDetails());
        order.setTotalPrice(newTotalPrice);
        order.setFinalPrice(newTotalPrice);

        orderRepository.save(order);
    }

    private boolean isSameProduct(OrderDetail detail, Long itemId, Long comboId) {
        if (itemId != null && detail.getItem() != null) {
            return detail.getItem().getId().equals(itemId);
        }
        if (comboId != null && detail.getCombo() != null) {
            return detail.getCombo().getId().equals(comboId);
        }
        return false;
    }
}
