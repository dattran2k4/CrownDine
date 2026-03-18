package com.crowndine.service.order.listener;

import com.crowndine.service.order.event.OrderPaidEvent;
import com.crowndine.service.product.ProductSalesService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;
import org.springframework.transaction.event.TransactionPhase;
import org.springframework.transaction.event.TransactionalEventListener;

@Component
@RequiredArgsConstructor
@Slf4j(topic = "ORDER-PAID-EVENT-LISTENER")
public class OrderPaidEventListener {

    private final ProductSalesService productSalesService;

    @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT)
    public void handle(OrderPaidEvent event) {
        log.info("Handling OrderPaidEvent for order id {}", event.orderId());
        productSalesService.syncSoldCountFromPaidOrder(event.orderId());
    }
}
