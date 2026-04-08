package com.crowndine.core.service.impl.order;

import com.crowndine.common.enums.EOrderStatus;
import com.crowndine.core.entity.Order;
import com.crowndine.core.entity.Voucher;
import com.crowndine.core.service.order.OrderPaymentService;
import com.crowndine.core.service.order.OrderStatusService;
import com.crowndine.core.service.order.OrderVoucherService;
import com.crowndine.core.service.order.event.OrderPaidEvent;
import com.crowndine.core.service.voucher.UserVoucherService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Slf4j(topic = "ORDER-PAYMENT-SERVICE")
public class OrderPaymentServiceImpl implements OrderPaymentService {

    private final OrderVoucherService orderVoucherService;
    private final UserVoucherService userVoucherService;
    private final OrderStatusService orderStatusService;
    private final ApplicationEventPublisher eventPublisher;

    @Override
    @Transactional(rollbackFor = Exception.class)
    public void markOrderAsPaid(Order order) {
        if (order.getStatus() == EOrderStatus.COMPLETED) {
            log.info("Order id {} is already completed. Skipping status update and OrderPaidEvent publishing.",
                    order.getId());
            return;
        }

        if (order.getVoucher() != null) {
            String customerUsername = order.getUser() != null ? order.getUser().getUsername() : null;
            orderVoucherService.validateVoucherForOrder(order.getId(), order.getVoucher().getCode(), customerUsername);
            Voucher consumedVoucher = userVoucherService.consumeVoucher(order.getVoucher().getCode(), customerUsername);
            order.setVoucher(consumedVoucher);
        }

        orderStatusService.transitionOrderStatus(order, EOrderStatus.COMPLETED);
        eventPublisher.publishEvent(new OrderPaidEvent(order.getId()));
        log.info("Order id {} status changed to {} and OrderPaidEvent published", order.getId(), order.getStatus());
    }
}
