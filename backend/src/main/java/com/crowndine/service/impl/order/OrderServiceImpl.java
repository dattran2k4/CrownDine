package com.crowndine.service.impl.order;

import com.crowndine.common.enums.EOrderStatus;
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
import com.crowndine.service.order.OrderDetailService;
import com.crowndine.service.order.OrderService;
import com.crowndine.service.voucher.UserVoucherService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.BeanUtils;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
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
    private final UserRepository userRepository;
    private final RestaurantTableRepository tableRepository;

    private final CalculationService calculationService;
    private final OrderDetailService orderDetailService;
    private final UserVoucherService userVoucherService;

    @Override
    public Order getOrderByCode(String code) {
        return orderRepository.findByCode(code).orElseThrow(() -> new ResourceNotFoundException("Order not found"));
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public void addOrderForReservation(Reservation reservation, OrderItemBatchRequest request, User user) {
        Order order = (reservation.getOrder() != null) ? reservation.getOrder() : new Order();

        order.setStatus(EOrderStatus.PRE_ORDER);
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
        order.setStatus(EOrderStatus.PRE_ORDER);
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

    @Override
    public PageResponse<OrderResponse> getAllOrders(LocalDate fromDate, LocalDate toDate, EOrderStatus status, int page, int size) {
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
    @Transactional(rollbackFor = Exception.class)
    public UpdateStatusOrderResponse updateOrderStatus(Long id, EOrderStatus status) {
        Order order = getOrder(id);

        order.setStatus(status);
        orderRepository.save(order);

        UpdateStatusOrderResponse response = new UpdateStatusOrderResponse();
        response.setId(order.getId());
        response.setStatus(order.getStatus());
        return response;
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public void createOrderByStaff(OrderRequest request, String username) {
        log.info("Processing create new order by staff username {}", username);
        User staff = userRepository.findByUsername(username).orElseThrow(() -> new ResourceNotFoundException("Staff not found"));

        RestaurantTable table = tableRepository.findById(request.getTableId()).orElseThrow(() -> new ResourceNotFoundException("Table not found"));
        Order order = new Order();
        order.setCode(UUID.randomUUID().toString());
        order.setStaff(staff);
        order.setStatus(EOrderStatus.CONFIRMED);
        order.setRestaurantTable(table);
        orderDetailService.addOrderDetailsForOrder(order, request.getItems());

        //Tính lại tổng hoá đơn
        order.setTotalPrice(calculationService.calculateTotalOrder(order.getOrderDetails()));
        order.setFinalPrice(order.getTotalPrice());

        Order result = orderRepository.save(order);
        log.info("Created order with id {}", result.getId());
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public void addDetailsToOrder(Long id, OrderItemBatchRequest request, String name) {
        Order order = getOrder(id);

        orderDetailService.addOrderDetailsForOrder(order, request.getItems());

        order.setTotalPrice(calculationService.calculateTotalOrder(order.getOrderDetails()));
        order.setFinalPrice(order.getTotalPrice());
        orderRepository.save(order);

        log.info("Added details for order id {}, details size = {}", order.getId(), request.getItems().size());
    }

    @Override
    public Order getOrder(Long id) {
        return orderRepository.findById(id).orElseThrow(() -> new ResourceNotFoundException("Order not found"));
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public OrderApplyVoucherResponse applyVoucherToOrder(Long orderId, String code, String username) {
        log.info("Applying voucher to order with id {}", orderId);

        Order order = getOrder(orderId);

        if (order.getStatus().isFinal()) {
            throw new InvalidDataException("Không thể áp voucher cho đơn đã hoàn tất hoặc đã hủy");
        }

        if (order.getVoucher() != null && !order.getVoucher().getCode().equalsIgnoreCase(code)) {
            userVoucherService.releaseVoucher(order.getVoucher().getCode(), username);
            order.setVoucher(null);
        }

        if (order.getOrderDetails().isEmpty()) {
            throw new InvalidDataException("Đơn hàng chưa có món để áp voucher");
        }

        BigDecimal totalPrice = calculationService.calculateTotalOrder(order.getOrderDetails());
        if (totalPrice.compareTo(BigDecimal.ZERO) <= 0) {
            throw new InvalidDataException("Tổng tiền đơn hàng phải lớn hơn 0 để áp voucher");
        }

        Voucher voucher = userVoucherService.consumeVoucher(code, username);

        BigDecimal discountPrice = calculationService.calculateVoucherDiscount(totalPrice, voucher);
        BigDecimal finalPrice = calculationService.calculateFinalTotalPrice(totalPrice, discountPrice);

        order.setVoucher(voucher);
        order.setTotalPrice(totalPrice);
        order.setDiscountPrice(discountPrice);
        order.setFinalPrice(finalPrice);

        Order updatedOrder = orderRepository.save(order);
        log.info("Applied successfully voucher {} to order {}", voucher.getCode(), updatedOrder.getId());

        return OrderApplyVoucherResponse.builder()
                .orderId(updatedOrder.getId())
                .orderCode(updatedOrder.getCode())
                .voucherId(voucher.getId())
                .voucherCode(voucher.getCode())
                .totalPrice(updatedOrder.getTotalPrice())
                .discountPrice(updatedOrder.getDiscountPrice())
                .finalPrice(updatedOrder.getFinalPrice())
                .build();
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public OrderApplyVoucherResponse removeVoucherFromOrder(Long orderId, String username) {
        log.info("Removing voucher from order with id {}", orderId);

        Order order = getOrder(orderId);

        if (order.getStatus().isFinal()) {
            throw new InvalidDataException("Không thể gỡ voucher cho đơn đã hoàn tất hoặc đã hủy");
        }

        if (order.getVoucher() == null) {
            throw new InvalidDataException("Đơn hàng chưa áp voucher");
        }

        String voucherCode = order.getVoucher().getCode();
        userVoucherService.releaseVoucher(voucherCode, username);

        order.setVoucher(null);

        BigDecimal totalPrice = calculationService.calculateTotalOrder(order.getOrderDetails());
        BigDecimal discountPrice = BigDecimal.ZERO;
        BigDecimal finalPrice = calculationService.calculateFinalTotalPrice(totalPrice, discountPrice);

        order.setTotalPrice(totalPrice);
        order.setDiscountPrice(discountPrice);
        order.setFinalPrice(finalPrice);

        Order updatedOrder = orderRepository.save(order);
        log.info("Removed voucher {} from order {}", voucherCode, updatedOrder.getId());

        return OrderApplyVoucherResponse.builder()
                .orderId(updatedOrder.getId())
                .orderCode(updatedOrder.getCode())
                .voucherId(null)
                .voucherCode(null)
                .totalPrice(updatedOrder.getTotalPrice())
                .discountPrice(updatedOrder.getDiscountPrice())
                .finalPrice(updatedOrder.getFinalPrice())
                .build();
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
            od.setTotalPrice(d.getTotalPrice());
            return od;
        }).toList();

        response.setOrderDetails(details);

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
