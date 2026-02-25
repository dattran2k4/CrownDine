package com.crowndine.service.impl.order;

import com.crowndine.common.enums.EOrderStatus;
import com.crowndine.common.enums.EReservationStatus;
import com.crowndine.dto.request.OrderItemBatchRequest;
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
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j(topic = "ORDER-SERVICE")
public class OrderServiceImpl implements OrderService {

    private final OrderRepository orderRepository;
    private final ReservationRepository reservationRepository;
    private final UserRepository userRepository;
    private final ItemRepository itemRepository;
    private final ComboRepository comboRepository;

    private final CalculationService calculationService;

    @Override
    public Order getOrderByCode(String code) {
        return orderRepository.findByCode(code).orElseThrow(() -> new ResourceNotFoundException("Order not found"));
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public void addOrderForReservation(Long reservationId, OrderItemBatchRequest request, String username) {
        log.info("Process saving order for reservation {}", reservationId);

        Reservation reservation = reservationRepository.findById(reservationId).orElseThrow(() -> new ResourceNotFoundException("Reservation not found"));
        User user = userRepository.findByUsername(username).orElseThrow(() -> new ResourceNotFoundException("User not found"));

        validateReservationBeforeOrder(reservation, user);

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
            }

            if (hasCombo) {
                Combo combo = comboRepository.findById(itemReq.getComboId())
                        .orElseThrow(() -> new ResourceNotFoundException("Combo not found"));
                detail.setCombo(combo);
                unitPrice = combo.getPriceAfterDiscount() != null ? combo.getPriceAfterDiscount() : combo.getPrice();
            }

            detail.setTotalPrice(unitPrice.multiply(BigDecimal.valueOf(itemReq.getQuantity())));

            orderDetails.add(detail);
        }
        order.setOrderDetails(orderDetails);
        order.setTotalPrice(calculationService.calculateTotalOrder(orderDetails));

        Order result = orderRepository.save(order);


        log.info("Order has been saved {}", result.getId());
    }

    private void validateReservationBeforeOrder(Reservation reservation, User user) {
        if (!reservation.getCustomer().getId().equals(user.getId())) {
            throw new InvalidDataException("Không có quyền thao tác đặt bàn này");
        }

        if (reservation.getStatus().equals(EReservationStatus.CANCELLED)) {
            throw new InvalidDataException("Đặt bàn đã bị hủy");
        }

        if (reservation.getStatus().equals(EReservationStatus.PENDING) && reservation.getExpiratedAt()
                != null && reservation.getExpiratedAt().isBefore(LocalDateTime.now())) {
            throw new InvalidDataException("Đặt bàn đã hết hạn giữ");
        }
    }

    @Override
    public void updateOrder(Long orderId) {
    }
}
