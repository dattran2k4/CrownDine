package com.crowndine.core.service.order;

import com.crowndine.common.enums.EOrderDetailStatus;
import com.crowndine.common.enums.EOrderStatus;
import com.crowndine.common.enums.EVoucherType;
import com.crowndine.presentation.dto.response.OrderApplyVoucherResponse;
import com.crowndine.presentation.dto.response.VoucherValidateResponse;
import com.crowndine.presentation.exception.InvalidDataException;
import com.crowndine.core.entity.Order;
import com.crowndine.core.entity.OrderDetail;
import com.crowndine.core.entity.User;
import com.crowndine.core.entity.UserVoucher;
import com.crowndine.core.entity.Voucher;
import com.crowndine.core.repository.OrderRepository;
import com.crowndine.core.repository.UserRepository;
import com.crowndine.core.repository.UserVoucherRepository;
import com.crowndine.core.service.CalculationService;
import com.crowndine.core.service.OrderPricingResult;
import com.crowndine.core.service.impl.order.OrderVoucherServiceImpl;
import com.crowndine.core.service.voucher.UserVoucherValidator;
import com.crowndine.core.service.voucher.VoucherService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class OrderVoucherServiceTest {

    @Mock
    private OrderRepository orderRepository;
    @Mock
    private UserRepository userRepository;
    @Mock
    private UserVoucherRepository userVoucherRepository;
    @Mock
    private CalculationService calculationService;
    @Mock
    private VoucherService voucherService;
    @Mock
    private UserVoucherValidator userVoucherValidator;

    private OrderVoucherService orderVoucherService;

    @BeforeEach
    void setUp() {
        orderVoucherService = new OrderVoucherServiceImpl(orderRepository, userRepository, userVoucherRepository,
                calculationService, voucherService, userVoucherValidator);
    }

    @Test
    void validateVoucherForOrder_shouldFailWhenOrderFinal() {
        Order order = baseOrder(EOrderStatus.COMPLETED, true);
        when(orderRepository.findById(1L)).thenReturn(Optional.of(order));

        InvalidDataException ex = assertThrows(InvalidDataException.class, () -> orderVoucherService.validateVoucherForOrder(1L, "SALE10", null));

        assertEquals("order.voucher.cannot_apply_to_final_order", ex.getMessage());
    }

    @Test
    void validateVoucherForOrder_shouldFailWhenNoItems() {
        Order order = baseOrder(EOrderStatus.CONFIRMED, false);
        when(orderRepository.findById(1L)).thenReturn(Optional.of(order));

        InvalidDataException ex = assertThrows(InvalidDataException.class, () -> orderVoucherService.validateVoucherForOrder(1L, "SALE10", null));

        assertEquals("order.voucher.order_has_no_items", ex.getMessage());
    }

    @Test
    void validateVoucherForOrder_shouldFailWhenMinValueNotMet() {
        Order order = baseOrder(EOrderStatus.CONFIRMED, true);
        Voucher voucher = baseVoucher("SALE10");
        voucher.setMinValue(new BigDecimal("500.00"));

        when(orderRepository.findById(1L)).thenReturn(Optional.of(order));
        when(calculationService.calculateTotalOrder(order.getOrderDetails())).thenReturn(new BigDecimal("300.00"));
        when(voucherService.getVoucherByCode("SALE10")).thenReturn(voucher);

        InvalidDataException ex = assertThrows(InvalidDataException.class,
                () -> orderVoucherService.validateVoucherForOrder(1L, "sale10", null));
        assertEquals("order.voucher.min_value_not_met", ex.getMessage());
    }

    @Test
    void validateVoucherForOrder_shouldFailWhenPersonalVoucherNotAssignedToUser() {
        Order order = baseOrder(EOrderStatus.CONFIRMED, true);
        User user = new User();
        user.setId(10L);
        user.setUsername("alice");
        order.setUser(user);

        Voucher voucher = baseVoucher("PERSONAL1");
        voucher.setUserVouchers(List.of(new UserVoucher()));

        when(orderRepository.findById(1L)).thenReturn(Optional.of(order));
        when(calculationService.calculateTotalOrder(order.getOrderDetails())).thenReturn(new BigDecimal("600.00"));
        when(voucherService.getVoucherByCode("PERSONAL1")).thenReturn(voucher);
        when(userRepository.findByUsername("alice")).thenReturn(Optional.of(user));
        when(userVoucherRepository.findByVoucher_IdAndCustomer_Id(voucher.getId(), user.getId())).thenReturn(Optional.empty());

        InvalidDataException ex = assertThrows(InvalidDataException.class,
                () -> orderVoucherService.validateVoucherForOrder(1L, "personal1", "alice")
        );

        assertEquals("voucher.not_assigned_to_user", ex.getMessage());
    }

    @Test
    void validateVoucherForOrder_shouldPassAndReturnDiscountAndFinal() {
        Order order = baseOrder(EOrderStatus.CONFIRMED, true);
        Voucher voucher = baseVoucher("SALE10");
        voucher.setMinValue(new BigDecimal("100.00"));

        when(orderRepository.findById(1L)).thenReturn(Optional.of(order));
        when(calculationService.calculateTotalOrder(order.getOrderDetails())).thenReturn(new BigDecimal("300.00"));
        when(voucherService.getVoucherByCode("SALE10")).thenReturn(voucher);
        when(calculationService.calculateVoucherDiscount(new BigDecimal("300.00"), voucher)).thenReturn(new BigDecimal("30.00"));
        when(calculationService.calculateFinalTotalPrice(new BigDecimal("300.00"), new BigDecimal("30.00")))
                .thenReturn(new BigDecimal("270.00"));

        VoucherValidateResponse response = orderVoucherService.validateVoucherForOrder(1L, "sale10", null);

        assertEquals(new BigDecimal("30.00"), response.getDiscountAmount());
        assertEquals(new BigDecimal("270.00"), response.getFinalAmount());
        assertEquals("SALE10", response.getCode());
    }

    @Test
    void applyVoucher_shouldSetVoucherAndUpdatePricing() {
        Order order = baseOrder(EOrderStatus.CONFIRMED, true);
        order.setId(1L);
        order.setCode("ORD-001");
        Voucher voucher = baseVoucher("SALE10");
        OrderPricingResult pricing = new OrderPricingResult(
                new BigDecimal("300.00"),
                new BigDecimal("30.00"),
                new BigDecimal("270.00")
        );

        when(orderRepository.findById(1L)).thenReturn(Optional.of(order), Optional.of(order));
        when(calculationService.calculateTotalOrder(order.getOrderDetails())).thenReturn(new BigDecimal("300.00"));
        when(voucherService.getVoucherByCode(anyString())).thenReturn(voucher);
        when(calculationService.calculateVoucherDiscount(any(BigDecimal.class), any(Voucher.class)))
                .thenReturn(new BigDecimal("30.00"));
        when(calculationService.calculateFinalTotalPrice(any(BigDecimal.class), any(BigDecimal.class)))
                .thenReturn(new BigDecimal("270.00"));
        when(calculationService.calculateOrderPricing(order)).thenReturn(pricing);
        when(orderRepository.save(order)).thenReturn(order);

        OrderApplyVoucherResponse response = orderVoucherService.applyVoucher(1L, "sale10", null);

        assertEquals(voucher, order.getVoucher());
        assertEquals(new BigDecimal("300.00"), order.getTotalPrice());
        assertEquals(new BigDecimal("30.00"), order.getDiscountPrice());
        assertEquals(new BigDecimal("270.00"), order.getFinalPrice());
        assertEquals("SALE10", response.getVoucherCode());
    }

    @Test
    void removeVoucher_shouldClearVoucherAndRecalculatePricing() {
        Order order = baseOrder(EOrderStatus.CONFIRMED, true);
        order.setId(2L);
        order.setCode("ORD-002");
        order.setVoucher(baseVoucher("OLD10"));

        OrderPricingResult pricing = new OrderPricingResult(
                new BigDecimal("400.00"),
                BigDecimal.ZERO,
                new BigDecimal("400.00")
        );

        when(orderRepository.findById(2L)).thenReturn(Optional.of(order));
        when(calculationService.calculateOrderPricing(order)).thenReturn(pricing);
        when(orderRepository.save(order)).thenReturn(order);

        OrderApplyVoucherResponse response = orderVoucherService.removeVoucher(2L, null);

        assertNull(order.getVoucher());
        assertEquals(new BigDecimal("400.00"), response.getFinalPrice());
    }

    @Test
    void applyVoucher_shouldDetachVoucherFromPreviousActiveOrders() {
        User user = new User();
        user.setId(100L);
        user.setUsername("alice");

        Order currentOrder = baseOrder(EOrderStatus.CONFIRMED, true);
        currentOrder.setId(10L);
        currentOrder.setCode("ORD-010");
        currentOrder.setUser(user);

        Voucher voucher = baseVoucher("UNIQUE10");
        voucher.setId(20L);

        Order previousOrder = baseOrder(EOrderStatus.CONFIRMED, true);
        previousOrder.setId(9L);
        previousOrder.setVoucher(voucher);
        previousOrder.setUser(user);

        when(orderRepository.findById(10L)).thenReturn(Optional.of(currentOrder), Optional.of(currentOrder));
        when(calculationService.calculateTotalOrder(currentOrder.getOrderDetails())).thenReturn(new BigDecimal("300.00"));
        when(voucherService.getVoucherByCode(anyString())).thenReturn(voucher);
        when(calculationService.calculateVoucherDiscount(any(BigDecimal.class), any(Voucher.class)))
                .thenReturn(new BigDecimal("30.00"));
        when(calculationService.calculateFinalTotalPrice(any(BigDecimal.class), any(BigDecimal.class)))
                .thenReturn(new BigDecimal("270.00"));
        when(orderRepository.findActiveOrdersUsingVoucherByUserId(100L, 20L, 10L, List.of(EOrderStatus.COMPLETED, EOrderStatus.CANCELLED)))
                .thenReturn(List.of(previousOrder));
        when(calculationService.calculateOrderPricing(previousOrder))
                .thenReturn(new OrderPricingResult(new BigDecimal("200.00"), BigDecimal.ZERO, new BigDecimal("200.00")));
        when(calculationService.calculateOrderPricing(currentOrder))
                .thenReturn(new OrderPricingResult(new BigDecimal("300.00"), new BigDecimal("30.00"), new BigDecimal("270.00")));
        when(orderRepository.save(any(Order.class))).thenAnswer(invocation -> invocation.getArgument(0));

        orderVoucherService.applyVoucher(10L, "unique10", "alice");

        assertNull(previousOrder.getVoucher());
        verify(orderRepository, times(2)).save(any(Order.class));
    }

    private Order baseOrder(EOrderStatus status, boolean withOneItem) {
        Order order = new Order();
        order.setStatus(status);
        if (withOneItem) {
            OrderDetail detail = new OrderDetail();
            detail.setStatus(EOrderDetailStatus.SERVED);
            detail.setTotalPrice(new BigDecimal("300.00"));
            order.setOrderDetails(List.of(detail));
        } else {
            order.setOrderDetails(List.of());
        }
        return order;
    }

    private Voucher baseVoucher(String code) {
        Voucher voucher = new Voucher();
        voucher.setId(1L);
        voucher.setCode(code);
        voucher.setName("Voucher " + code);
        voucher.setType(EVoucherType.PERCENTAGE);
        voucher.setDiscountValue(new BigDecimal("10"));
        voucher.setMinValue(BigDecimal.ZERO);
        voucher.setUserVouchers(List.of());
        return voucher;
    }
}
