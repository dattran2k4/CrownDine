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
import com.crowndine.service.OrderPricingResult;
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

    private static final String ORDER_NOT_FOUND_MESSAGE = "order.not_found";

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
            throw new InvalidDataException("order.voucher.order_not_owned_by_user");
        }

        if (order.getStatus().isFinal()) {
            throw new InvalidDataException("order.voucher.cannot_apply_to_final_order");
        }

        if (order.getOrderDetails().isEmpty()) {
            throw new InvalidDataException("order.voucher.order_has_no_items");
        }

        BigDecimal totalOrder = calculationService.calculateTotalOrder(order.getOrderDetails());
        if (totalOrder.compareTo(BigDecimal.ZERO) <= 0) {
            throw new InvalidDataException("order.voucher.order_total_must_be_positive");
        }

        String normalizedCode = code.trim().toUpperCase(Locale.ROOT);
        Voucher voucher = voucherService.getVoucherByCode(normalizedCode);

        if (voucher.getMinValue() != null && totalOrder.compareTo(voucher.getMinValue()) < 0) {
            throw new InvalidDataException("order.voucher.min_value_not_met");
        }

        boolean isPersonal = !voucher.getUserVouchers().isEmpty();
        int usageCount = 0;
        Integer usageLimit = null;

        if (isPersonal) {
            if (username == null) {
                throw new InvalidDataException("order.voucher.personal_requires_customer");
            }

            User user = userRepository.findByUsername(username).orElseThrow(() -> new ResourceNotFoundException("user.not_found"));
            UserVoucher userVoucher = userVoucherRepository.findByVoucher_IdAndCustomer_Id(voucher.getId(), user.getId()).orElseThrow(() -> new InvalidDataException("voucher.not_assigned_to_user"));

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
            throw new InvalidDataException("order.voucher.cannot_apply_to_final_order");
        }

        if (order.getOrderDetails().isEmpty()) {
            throw new InvalidDataException("order.voucher.order_has_no_items");
        }

        String customerUsername = order.getUser() != null ? order.getUser().getUsername() : null;

        if (order.getVoucher() != null && !order.getVoucher().getCode().equalsIgnoreCase(code)) {
            order.setVoucher(null);
        }

        validateVoucherForOrderInternal(orderId, code, customerUsername);
        Voucher voucher = voucherService.getVoucherByCode(code);

        detachVoucherFromPreviousOrders(order, voucher);

        order.setVoucher(voucher);
        applyPricing(order);

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
            throw new InvalidDataException("order.voucher.cannot_remove_from_final_order");
        }

        if (order.getVoucher() == null) {
            throw new InvalidDataException("order.voucher.order_has_no_voucher");
        }

        order.setVoucher(null);

        applyPricing(order);

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
        applyPricing(order);
    }

    private void applyPricing(Order order) {
        OrderPricingResult pricing = calculationService.calculateOrderPricing(order);
        order.setTotalPrice(pricing.totalPrice());
        order.setDiscountPrice(pricing.discountPrice());
        order.setFinalPrice(pricing.finalPrice());
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
            throw new InvalidDataException("voucher.expired");
        }

        int usageCount = userVoucher.getUsageCount() == null ? 0 : userVoucher.getUsageCount();
        Integer usageLimit = userVoucher.getUsageLimit();
        if (usageLimit != null && usageCount >= usageLimit) {
            throw new InvalidDataException("voucher.usage_exhausted");
        }
    }
}
