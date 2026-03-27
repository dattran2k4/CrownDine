package com.crowndine.service.impl.order;

import com.crowndine.common.enums.EOrderStatus;
import com.crowndine.dto.response.OrderApplyVoucherResponse;
import com.crowndine.dto.response.VoucherValidateResponse;
import com.crowndine.exception.InvalidDataException;
import com.crowndine.exception.ResourceNotFoundException;
import com.crowndine.model.Order;
import com.crowndine.model.User;
import com.crowndine.model.UserVoucher;
import com.crowndine.model.Voucher;
import com.crowndine.repository.OrderRepository;
import com.crowndine.repository.UserRepository;
import com.crowndine.repository.UserVoucherRepository;
import com.crowndine.service.CalculationService;
import com.crowndine.service.order.OrderVoucherService;
import com.crowndine.service.voucher.VoucherService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Locale;

@Service
@RequiredArgsConstructor
@Slf4j(topic = "ORDER-VOUCHER-SERVICE")
public class OrderVoucherServiceImpl implements OrderVoucherService {

    private static final String ORDER_NOT_FOUND_MESSAGE = "Order not found";

    private final OrderRepository orderRepository;
    private final UserRepository userRepository;
    private final UserVoucherRepository userVoucherRepository;
    private final CalculationService calculationService;
    private final VoucherService voucherService;

    @Override
    @Transactional(readOnly = true)
    public VoucherValidateResponse validateVoucherForOrder(Long orderId, String code, String username) {
        return validateVoucherForOrderInternal(orderId, code, username);
    }

    private VoucherValidateResponse validateVoucherForOrderInternal(Long orderId, String code, String username) {
        Order order = getOrderById(orderId);

        if (order.getUser() != null && username != null && !order.getUser().getUsername().equals(username)) {
            throw new InvalidDataException("Đơn hàng này không phải của user");
        }

        if (order.getStatus().isFinal()) {
            throw new InvalidDataException("Không thể áp voucher cho đơn đã hoàn tất hoặc đã hủy");
        }

        if (order.getOrderDetails().isEmpty()) {
            throw new InvalidDataException("Đơn hàng chưa có món để áp voucher");
        }

        BigDecimal totalOrder = calculationService.calculateTotalOrder(order.getOrderDetails());
        if (totalOrder.compareTo(BigDecimal.ZERO) <= 0) {
            throw new InvalidDataException("Tổng tiền đơn hàng phải lớn hơn 0 để áp voucher");
        }

        String normalizedCode = code.trim().toUpperCase(Locale.ROOT);
        Voucher voucher = voucherService.getVoucherByCode(normalizedCode);

        if (voucher.getMinValue() != null && totalOrder.compareTo(voucher.getMinValue()) < 0) {
            throw new InvalidDataException("Đơn hàng chưa đạt giá trị tối thiểu để áp voucher");
        }

        boolean isPersonal = !voucher.getUserVouchers().isEmpty();
        int usageCount = 0;
        Integer usageLimit = null;

        if (isPersonal) {
            if (username == null) {
                throw new InvalidDataException("Voucher này là voucher cá nhân, vui lòng thêm thông tin khách hàng vào đơn");
            }

            User user = userRepository.findByUsername(username).orElseThrow(() -> new ResourceNotFoundException("User not found"));
            UserVoucher userVoucher = userVoucherRepository.findByVoucher_IdAndCustomer_Id(voucher.getId(), user.getId()).orElseThrow(() -> new InvalidDataException("Voucher chưa được gán cho người dùng"));

            validateUserVoucherAvailability(userVoucher);
            usageCount = userVoucher.getUsageCount() == null ? 0 : userVoucher.getUsageCount();
            usageLimit = userVoucher.getUsageLimit();
        }

        BigDecimal discountAmount = calculationService.calculateVoucherDiscount(totalOrder, voucher);
        BigDecimal finalAmount = calculationService.calculateFinalTotalPrice(totalOrder, discountAmount);

        return VoucherValidateResponse.builder()
                .voucherId(voucher.getId())
                .code(voucher.getCode())
                .name(voucher.getName())
                .type(voucher.getType())
                .orderAmount(totalOrder)
                .minValue(voucher.getMinValue())
                .discountAmount(discountAmount)
                .finalAmount(finalAmount)
                .usageCount(usageCount)
                .usageLimit(usageLimit)
                .build();
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public OrderApplyVoucherResponse applyVoucher(Long orderId, String code, String username) {
        log.info("Applying voucher to order {}", orderId);

        Order order = getOrderById(orderId);

        if (order.getStatus().isFinal()) {
            throw new InvalidDataException("Không thể áp voucher cho đơn đã hoàn tất hoặc đã hủy");
        }

        if (order.getOrderDetails().isEmpty()) {
            throw new InvalidDataException("Đơn hàng chưa có món để áp voucher");
        }

        String customerUsername = order.getUser() != null ? order.getUser().getUsername() : null;

        if (order.getVoucher() != null && !order.getVoucher().getCode().equalsIgnoreCase(code)) {
            order.setVoucher(null);
        }

        BigDecimal totalPrice = calculationService.calculateTotalOrder(order.getOrderDetails());

        validateVoucherForOrderInternal(orderId, code, customerUsername);
        Voucher voucher = voucherService.getVoucherByCode(code);

        detachVoucherFromPreviousOrders(order, voucher);

        BigDecimal discountPrice = calculationService.calculateVoucherDiscount(totalPrice, voucher);
        BigDecimal finalPrice = calculationService.calculateFinalTotalPrice(totalPrice, discountPrice);

        order.setVoucher(voucher);
        order.setTotalPrice(totalPrice);
        order.setDiscountPrice(discountPrice);
        order.setFinalPrice(finalPrice);

        Order updatedOrder = orderRepository.save(order);
        log.info("Applied voucher {} to order {}", voucher.getCode(), updatedOrder.getId());

        return buildResponse(updatedOrder);
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public OrderApplyVoucherResponse removeVoucher(Long orderId, String username) {
        log.info("Removing voucher from order {}", orderId);

        Order order = getOrderById(orderId);

        if (order.getStatus().isFinal()) {
            throw new InvalidDataException("Không thể gỡ voucher cho đơn đã hoàn tất hoặc đã hủy");
        }

        if (order.getVoucher() == null) {
            throw new InvalidDataException("Đơn hàng chưa áp voucher");
        }

        order.setVoucher(null);

        BigDecimal totalPrice = calculationService.calculateTotalOrder(order.getOrderDetails());
        order.setTotalPrice(totalPrice);
        order.setDiscountPrice(BigDecimal.ZERO);
        order.setFinalPrice(totalPrice);

        Order updatedOrder = orderRepository.save(order);
        log.info("Removed voucher from order {}", updatedOrder.getId());

        return buildResponse(updatedOrder);
    }

    private void detachVoucherFromPreviousOrders(Order currentOrder, Voucher voucher) {
        if (voucher == null || currentOrder.getUser() == null) {
            return;
        }

        List<EOrderStatus> finalStatuses = List.of(EOrderStatus.COMPLETED, EOrderStatus.CANCELLED);
        List<Order> previousOrders = orderRepository.findActiveOrdersUsingVoucherByUserId(
                currentOrder.getUser().getId(),
                voucher.getId(),
                currentOrder.getId(),
                finalStatuses
        );

        if (previousOrders.isEmpty()) {
            return;
        }

        previousOrders.forEach(previousOrder -> {
            previousOrder.setVoucher(null);
            recalculateOrderPricing(previousOrder);
            orderRepository.save(previousOrder);
            log.info("Detached voucher {} from previous order {}", voucher.getCode(), previousOrder.getId());
        });
    }

    private void recalculateOrderPricing(Order order) {
        BigDecimal totalPrice = calculationService.calculateTotalOrder(order.getOrderDetails());
        order.setTotalPrice(totalPrice);

        if (order.getVoucher() == null) {
            order.setDiscountPrice(BigDecimal.ZERO);
            order.setFinalPrice(totalPrice);
            return;
        }

        BigDecimal discountPrice = calculationService.calculateVoucherDiscount(totalPrice, order.getVoucher());
        BigDecimal finalPrice = calculationService.calculateFinalTotalPrice(totalPrice, discountPrice);
        order.setDiscountPrice(discountPrice);
        order.setFinalPrice(finalPrice);
    }

    private OrderApplyVoucherResponse buildResponse(Order order) {
        return OrderApplyVoucherResponse.builder()
                .orderId(order.getId())
                .orderCode(order.getCode())
                .voucherId(order.getVoucher() != null ? order.getVoucher().getId() : null)
                .voucherCode(order.getVoucher() != null ? order.getVoucher().getCode() : null)
                .totalPrice(order.getTotalPrice())
                .discountPrice(order.getDiscountPrice())
                .finalPrice(order.getFinalPrice())
                .build();
    }

    private Order getOrderById(Long orderId) {
        return orderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException(ORDER_NOT_FOUND_MESSAGE));
    }

    private void validateUserVoucherAvailability(UserVoucher userVoucher) {
        if (userVoucher.getExpiredAt() != null && !userVoucher.getExpiredAt().isAfter(LocalDateTime.now())) {
            throw new InvalidDataException("Voucher đã hết hạn");
        }

        int usageCount = userVoucher.getUsageCount() == null ? 0 : userVoucher.getUsageCount();
        Integer usageLimit = userVoucher.getUsageLimit();
        if (usageLimit != null && usageCount >= usageLimit) {
            throw new InvalidDataException("Voucher đã hết lượt sử dụng");
        }
    }
}
