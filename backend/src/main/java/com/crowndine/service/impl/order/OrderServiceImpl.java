package com.crowndine.service.impl.order;

import com.crowndine.common.enums.EOrderStatus;
import com.crowndine.common.enums.EReservationStatus;
import com.crowndine.dto.request.OrderItemBatchRequest;
import com.crowndine.dto.request.OrderItemRemoveRequest;
import com.crowndine.dto.request.OrderItemRequest;
import com.crowndine.dto.request.OrderRequest;
import com.crowndine.dto.response.*;
import com.crowndine.exception.InvalidDataException;
import com.crowndine.exception.ResourceNotFoundException;
import com.crowndine.model.*;
import com.crowndine.repository.*;
import com.crowndine.service.CalculationService;
import com.crowndine.service.OrderPricingResult;
import com.crowndine.service.order.OrderDetailService;
import com.crowndine.service.order.OrderService;
import com.crowndine.service.order.OrderStatusService;
import com.crowndine.service.order.OrderVoucherService;
import com.crowndine.service.voucher.UserVoucherService;
import com.crowndine.common.utils.CodeUtils;
import org.springframework.beans.BeanUtils;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
@Slf4j(topic = "ORDER-SERVICE")
public class OrderServiceImpl implements OrderService {

    private final OrderRepository orderRepository;
    private final ItemRepository itemRepository;
    private final ComboRepository comboRepository;
    private final UserRepository userRepository;
    private final ReservationRepository reservationRepository;
    private final RestaurantTableRepository tableRepository;

    private final CalculationService calculationService;
    private final OrderDetailService orderDetailService;
    private final OrderStatusService orderStatusService;
    private final OrderVoucherService orderVoucherService;

    private static final String ORDER_NOT_FOUND_MESSAGE = "Order not found";

    @Override
    public Order getOrderByCode(String code) {
        return orderRepository.findByCode(code)
                .orElseThrow(() -> new ResourceNotFoundException(ORDER_NOT_FOUND_MESSAGE));
    }

    @Override
    public Order createOrderForReservation(Reservation reservation, User user, EOrderStatus initialStatus) {
        log.info("Creating reservation order for reservation id {} with status {}", reservation.getId(), initialStatus);
        return createReservationOrder(reservation, user, initialStatus);
    }

    private Order createReservationOrder(Reservation reservation, User user, EOrderStatus status) {
        Order order = new Order();
        order.setReservation(reservation);
        order.setUser(user);
        order.setRestaurantTable(reservation.getTable());
        order.setStatus(status);
        order.setTotalPrice(BigDecimal.ZERO);
        order.setFinalPrice(BigDecimal.ZERO);
        order.setDiscountPrice(BigDecimal.ZERO);
        order.setCode(CodeUtils.generateOrderCode());

        Order result = orderRepository.save(order);
        log.info("New order has been created with id {} for reservationId {}", result.getId(), reservation.getId());
        return result;
    }

    @Override
    public Order confirmReservationOrder(Order order) {
        Order updatedOrder = orderStatusService.transitionOrderStatus(order, EOrderStatus.CONFIRMED);
        log.info("Updated reservation order {} status to CONFIRMED", updatedOrder.getId());
        return updatedOrder;
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public void addOrUpdateItemToOrder(Long orderId, OrderItemRequest request) {
        log.info("Processing add item {} for order {}", request.getItemId(), orderId);
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException(ORDER_NOT_FOUND_MESSAGE));

        List<OrderDetail> orderDetails = order.getOrderDetails();

        // Check trùng orderDetails item id == request item id
        Optional<OrderDetail> existedDetail = orderDetails
                .stream()
                .filter(detail -> isSameProduct(detail, request.getItemId(), request.getComboId()))
                .findFirst();

        // Nếu có thì update quantity
        if (existedDetail.isPresent()) {
            log.info("Updating existed item {} for order {}", request.getItemId(), orderId);
            existedDetail.get().setQuantity(existedDetail.get().getQuantity() + request.getQuantity());
            existedDetail.get().setNote(request.getNote());
            existedDetail.get().calculateAndSetTotalPrice();
        }

        // Không có thì tạo mới order detail rồi order.add
        else {
            log.info("Adding new item {} for order {}", request.getItemId(), orderId);
            OrderDetail detail = new OrderDetail();
            if (request.getItemId() != null) {
                detail.setItem(itemRepository.findById(request.getItemId())
                        .orElseThrow(() -> new ResourceNotFoundException("Item not found")));
            } else {
                detail.setCombo(comboRepository.findById(request.getComboId())
                        .orElseThrow(() -> new ResourceNotFoundException("Combo not found")));
            }
            detail.setQuantity(request.getQuantity());
            detail.setNote(request.getNote());
            detail.setOrder(order);
            detail.setStatus(com.crowndine.common.enums.EOrderDetailStatus.PENDING);
            detail.calculateAndSetTotalPrice();
            orderDetails.add(detail);
        }

        recalculateOrderPricing(order);

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

        recalculateOrderPricing(order);

        orderRepository.save(order);
        log.info("Updating quantity or note for detailId successfully for detailId {}", detailToUpdate.getId());
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public void removeOrderItemInReservation(Order order, OrderItemRemoveRequest request) {
        log.info("Removing order item  for order {}", order.getId());

        boolean removed = order.getOrderDetails()
                .removeIf(detail -> isSameProduct(detail, request.getItemId(), request.getComboId()));

        if (!removed) {
            throw new ResourceNotFoundException("Sản phẩm này không tồn tại trong đơn hàng để xóa");
        }

        log.info("Item removed successfully from order list");

        recalculateOrderPricing(order);

        orderRepository.save(order);
    }

    @Override
    public PageResponse<OrderResponse> getAllOrders(LocalDate fromDate, LocalDate toDate, EOrderStatus status, int page,
                                                    int size) {
        int pageNumber = (page > 0) ? page - 1 : 0;

        PageRequest pageRequest = PageRequest.of(pageNumber, size, Sort.by(Sort.Direction.DESC, "id"));

        Specification<Order> specification = OrderSpecification.filterOrders(fromDate, toDate, status);

        Page<Order> entityPage = orderRepository.findAll(specification, pageRequest);

        List<OrderResponse> response = entityPage.stream().map(this::toResponse).toList();

        return PageResponse.<OrderResponse>builder()
                .page(page)
                .pageSize(size)
                .totalPages(entityPage.getTotalPages())
                .totalItems(entityPage.getTotalElements())
                .data(response)
                .build();
    }

    @Override
    public void createWalkInOrder(OrderRequest request, String username) {
        log.info("Processing create new walk-in order by username {}", username);
        User staff = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("Staff not found"));

        RestaurantTable table = tableRepository.findById(request.getTableId())
                .orElseThrow(() -> new ResourceNotFoundException("Table not found"));
        Order order = new Order();
        order.setCode(CodeUtils.generateOrderCode());
        order.setStaff(staff);
        order.setStatus(EOrderStatus.CONFIRMED);
        order.setRestaurantTable(table);
        orderRepository.save(order);
        orderStatusService.transitionOrderStatus(order, EOrderStatus.CONFIRMED);

        orderDetailService.createPendingOrderDetails(order, request.getItems());
        recalculateOrderPricing(order);

        Order result = orderRepository.save(order);
        log.info("Created order with id {}, totalPrice = {}, finalPrice = {}", result.getId(), order.getTotalPrice(),
                order.getFinalPrice());
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public OrderResponse openOrderForReservation(Long reservationId, OrderItemBatchRequest request, String username) {
        log.info("Opening order for reservation {} by staff {}", reservationId, username);

        Reservation reservation = reservationRepository.findById(reservationId)
                .orElseThrow(() -> new ResourceNotFoundException("Reservation not found"));
        User staff = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("Staff not found"));

        if (reservation.getStatus() != EReservationStatus.CHECKED_IN) {
            throw new InvalidDataException("Cần check-in trước khi tạo order cho đặt bàn này");
        }

        if (reservation.getOrder() != null) {
            throw new InvalidDataException("Đặt bàn này đã có order");
        }

        Order order = createOrderForReservation(reservation, reservation.getUser(), EOrderStatus.CONFIRMED);
        order.setStaff(staff);
        orderDetailService.createPendingOrderDetails(order, request.getItems());
        recalculateOrderPricing(order);
        reservation.setOrder(order);
        Order savedOrder = orderRepository.save(order);
        orderStatusService.transitionOrderStatus(savedOrder, EOrderStatus.CONFIRMED);

        return toResponse(savedOrder);
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public void appendItemsToOrder(Long id, OrderItemBatchRequest request, String name) {
        Order order = getOrder(id);

        orderDetailService.createPendingOrderDetails(order, request.getItems());

        recalculateOrderPricing(order);
        orderRepository.save(order);

        log.info("Added details for order id {}, details size = {}", order.getId(), request.getItems().size());
    }

    @Override
    public Order getOrder(Long id) {
        return orderRepository.findById(id).orElseThrow(() -> new ResourceNotFoundException(ORDER_NOT_FOUND_MESSAGE));
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public void mapCustomerToOrder(Long orderId, Long customerId) {
        Order order = getOrder(orderId);
        User customer = userRepository.findById(customerId)
                .orElseThrow(() -> new ResourceNotFoundException("Customer not found"));
        order.setUser(customer);
        orderRepository.save(order);
        log.info("Mapped user {} to order {}", customerId, orderId);
    }

    @Override
    public List<OrderResponse> getKitchenOrders() {
        List<EOrderStatus> activeStatuses = List.of(EOrderStatus.CONFIRMED, EOrderStatus.IN_PROGRESS);
        List<Order> orders = orderRepository.findByStatusIn(activeStatuses);
        log.info("Found {} active kitchen orders", orders.size());
        return orders.stream().map(this::toResponse).toList();
    }

    private void recalculateOrderPricing(Order order) {
        OrderPricingResult pricing = calculationService.calculateOrderPricing(order);
        order.setTotalPrice(pricing.totalPrice());
        order.setDiscountPrice(pricing.discountPrice());
        order.setFinalPrice(pricing.finalPrice());
    }

    private OrderResponse toResponse(Order order) {
        OrderResponse response = new OrderResponse();
        BeanUtils.copyProperties(order, response);
        response.setId(order.getId());

        if (order.getStaff() != null) {
            response.setStaffName(order.getStaff().getFullName());
        }

        if (order.getUser() != null) {
            response.setGuestName(order.getUser().getFullName());
        }

        if (order.getRestaurantTable() != null) {
            response.setTableName(order.getRestaurantTable().getName());
        }

        List<OrderDetailResponse> details = order.getOrderDetails().stream().map(d -> {
            OrderDetailResponse od = new OrderDetailResponse();
            od.setId(d.getId());
            if (d.getCombo() != null) {
                od.setCombo(toComboResponse(d.getCombo()));
            } else if (d.getItem() != null) {
                od.setItem(toItemResponse(d.getItem()));
            }
            od.setQuantity(d.getQuantity());
            od.setNote(d.getNote());
            od.setStatus(d.getStatus());
            od.setTotalPrice(d.getTotalPrice());
            od.setCreatedAt(d.getCreatedAt());
            return od;
        }).toList();

        response.setOrderDetails(details);

        if (order.getVoucher() != null) {
            OrderResponse.VoucherSlimResponse vr = new OrderResponse.VoucherSlimResponse();
            vr.setId(order.getVoucher().getId());
            vr.setCode(order.getVoucher().getCode());
            vr.setName(order.getVoucher().getName());
            response.setVoucher(vr);
        }

        return response;
    }

    private ComboResponse toComboResponse(Combo combo) {
        return ComboResponse.builder()
                .id(combo.getId())
                .name(combo.getName())
                .description(combo.getDescription())
                .price(combo.getPrice())
                .build();
    }

    private ItemResponse toItemResponse(Item item) {
        return ItemResponse.builder()
                .id(item.getId())
                .name(item.getName())
                .description(item.getDescription())
                .price(item.getPrice())
                .build();
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
