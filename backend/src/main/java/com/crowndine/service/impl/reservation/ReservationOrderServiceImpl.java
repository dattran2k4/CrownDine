package com.crowndine.service.impl.reservation;

import com.crowndine.common.enums.EOrderStatus;
import com.crowndine.common.enums.EReservationStatus;
import com.crowndine.common.enums.ERole;
import com.crowndine.dto.request.OrderItemRemoveRequest;
import com.crowndine.dto.request.OrderItemRequest;
import com.crowndine.dto.response.OrderDetailHistoryResponse;
import com.crowndine.dto.response.OrderLineResponse;
import com.crowndine.exception.InvalidDataException;
import com.crowndine.exception.ResourceNotFoundException;
import com.crowndine.model.Order;
import com.crowndine.model.OrderDetail;
import com.crowndine.model.Reservation;
import com.crowndine.model.RestaurantTable;
import com.crowndine.model.User;
import com.crowndine.repository.FeedbackRepository;
import com.crowndine.repository.OrderDetailRepository;
import com.crowndine.repository.ReservationRepository;
import com.crowndine.repository.UserRepository;
import com.crowndine.service.CalculationService;
import com.crowndine.service.order.OrderService;
import com.crowndine.service.reservation.ReservationOrderService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.List;

import static com.crowndine.service.impl.CalculationServiceImpl.DEPOSIT_RATE;

@Service
@RequiredArgsConstructor
@Slf4j(topic = "RESERVATION-ORDER-SERVICE")
public class ReservationOrderServiceImpl implements ReservationOrderService {
    private final ReservationRepository reservationRepository;
    private final UserRepository userRepository;
    private final OrderDetailRepository orderDetailRepository;
    private final FeedbackRepository feedbackRepository;
    private final CalculationService calculationService;
    private final OrderService orderService;

    @Override
    @Transactional(readOnly = true)
    public OrderDetailHistoryResponse getReservationOrderDetails(Long reservationId) {
        Reservation reservation = getReservationById(reservationId);
        Order order = reservation.getOrder();

        if (order == null) {
            return createEmptyOrderDetailResponse(reservation);
        }

        return toOrderDetailPageResponse(order);
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public void addItemToReservationOrder(Long reservationId, OrderItemRequest request, String username) {
        log.info("Adding order item for reservation id {}", reservationId);

        Reservation reservation = getReservationById(reservationId);
        User user = getUserByUserName(username);
        validateReservationForUser(reservation, user);

        Order order = reservation.getOrder();
        if (order == null) {
            order = orderService.createOrderForReservation(reservation, user, resolveReservationOrderStatus(reservation));
            reservation.setOrder(order);
            reservationRepository.save(reservation);
        }

        orderService.addOrUpdateItemToOrder(order.getId(), request);
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public void updateReservationOrderItem(Long reservationId, OrderItemRequest request, String username) {
        log.info("Processing update order item for reservation id {}", reservationId);

        Reservation reservation = getReservationById(reservationId);
        User user = getUserByUserName(username);
        validateReservationForUser(reservation, user);

        if (reservation.getOrder() == null) {
            throw new InvalidDataException("Đặt bàn này chưa có đơn hàng để cập nhật");
        }

        orderService.updateOrderItemInReservation(reservation.getOrder(), request);
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public void removeReservationOrderItem(Long reservationId, OrderItemRemoveRequest request, String username) {
        log.info("Processing remove order item for reservation id {}", reservationId);

        Reservation reservation = getReservationById(reservationId);
        User user = getUserByUserName(username);
        validateReservationForUser(reservation, user);

        if (reservation.getOrder() == null) {
            throw new InvalidDataException("Đặt bàn này chưa có đơn hàng để xóa món");
        }

        orderService.removeOrderItemInReservation(reservation.getOrder(), request);
    }

    private Reservation getReservationById(Long reservationId) {
        return reservationRepository.findById(reservationId).orElseThrow(() -> new ResourceNotFoundException("Reservation not found"));
    }

    private User getUserByUserName(String username) {
        return userRepository.findByUsername(username).orElseThrow(() -> new ResourceNotFoundException("User not found"));
    }

    private void validateReservationForUser(Reservation reservation, User user) {
        boolean isOwner = reservation.getUser() != null && reservation.getUser().getId().equals(user.getId());
        boolean hasPrivilege = user.getRoles().stream()
                .anyMatch(role -> role.getName() == ERole.STAFF || role.getName() == ERole.ADMIN);

        if (!isOwner && !hasPrivilege) {
            throw new InvalidDataException("Không có quyền thao tác đặt bàn này");
        }
    }

    private OrderLineResponse toLineResponse(OrderDetail orderDetail, Long userId) {
        OrderLineResponse response = new OrderLineResponse();
        response.setOrderDetailId(orderDetail.getId());
        Long itemId = orderDetail.getItem() != null ? orderDetail.getItem().getId() : null;
        response.setProductId(orderDetail.getCombo() != null ? orderDetail.getCombo().getId() : itemId);
        response.setName(orderDetail.getProductName());
        response.setType(orderDetail.getCombo() != null ? "COMBO" : "ITEM");
        response.setQuantity(orderDetail.getQuantity());
        response.setTotalPrice(orderDetail.getTotalPrice());

        if (userId != null) {
            response.setHasFeedback(feedbackRepository.existsByUser_IdAndOrderDetail_Id(userId, orderDetail.getId()));
        }

        if (orderDetail.getCombo() != null) {
            response.setUnitPrice(orderDetail.getCombo().getPrice());
        } else if (orderDetail.getItem() != null) {
            response.setUnitPrice(orderDetail.getItem().getPrice());
        }

        return response;
    }

    private OrderDetailHistoryResponse toOrderDetailPageResponse(Order order) {
        List<OrderDetail> orderDetails = orderDetailRepository.findByOrder_Id(order.getId());
        List<OrderLineResponse> data = orderDetails.stream()
                .map(orderDetail -> toLineResponse(orderDetail, order.getUser() != null ? order.getUser().getId() : null))
                .toList();

        BigDecimal tableDeposit = getTableDeposit(order.getRestaurantTable());
        BigDecimal totalPrice = defaultMoney(order.getTotalPrice());
        BigDecimal discountPrice = defaultMoney(order.getDiscountPrice());
        BigDecimal finalPrice = defaultMoney(order.getFinalPrice());
        BigDecimal itemsTotal = totalPrice;
        BigDecimal depositAmount = calculationService.calculateDepositPayment(finalPrice, tableDeposit);
        BigDecimal remainingAmount = finalPrice.subtract(finalPrice.multiply(DEPOSIT_RATE))
                .setScale(2, RoundingMode.HALF_UP);

        OrderDetailHistoryResponse response = new OrderDetailHistoryResponse();
        response.setOrderId(order.getId());
        response.setTableName(order.getRestaurantTable() != null ? order.getRestaurantTable().getName() : null);
        response.setStatus(order.getStatus());
        response.setTotalPrice(totalPrice);
        response.setDiscountPrice(discountPrice);
        response.setFinalPrice(finalPrice);
        response.setItemsTotal(itemsTotal);
        response.setTableDeposit(tableDeposit);
        response.setDepositAmount(depositAmount);
        response.setRemainingAmount(remainingAmount);
        response.setCreatedAt(order.getCreatedAt());
        response.setItems(data);
        return response;
    }

    private EOrderStatus resolveReservationOrderStatus(Reservation reservation) {
        if (reservation.getStatus() == EReservationStatus.CHECKED_IN) {
            return EOrderStatus.CONFIRMED;
        }

        return EOrderStatus.PRE_ORDER;
    }

    private OrderDetailHistoryResponse createEmptyOrderDetailResponse(Reservation reservation) {
        OrderDetailHistoryResponse response = new OrderDetailHistoryResponse();
        response.setOrderId(null);
        response.setTableName(reservation.getTable() != null ? reservation.getTable().getName() : null);
        response.setStatus(resolveReservationOrderStatus(reservation));
        response.setTotalPrice(BigDecimal.ZERO);
        response.setDiscountPrice(BigDecimal.ZERO);
        response.setFinalPrice(BigDecimal.ZERO);
        response.setItemsTotal(BigDecimal.ZERO);
        response.setTableDeposit(getTableDeposit(reservation.getTable()));
        response.setDepositAmount(BigDecimal.ZERO);
        response.setRemainingAmount(BigDecimal.ZERO);
        response.setItems(List.of());
        return response;
    }

    private BigDecimal getTableDeposit(RestaurantTable table) {
        if (table == null || table.getBaseDeposit() == null) {
            return BigDecimal.ZERO;
        }

        return table.getBaseDeposit().setScale(2, RoundingMode.HALF_UP);
    }

    private BigDecimal defaultMoney(BigDecimal amount) {
        return amount != null ? amount : BigDecimal.ZERO;
    }
}
