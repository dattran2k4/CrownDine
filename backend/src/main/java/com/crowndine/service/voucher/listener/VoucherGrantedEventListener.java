package com.crowndine.service.voucher.listener;

import com.crowndine.service.notification.NotificationService;
import com.crowndine.service.voucher.event.VoucherGrantedEvent;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Component;
import org.springframework.transaction.event.TransactionPhase;
import org.springframework.transaction.event.TransactionalEventListener;

@Component
@RequiredArgsConstructor
@Slf4j(topic = "VOUCHER-GRANTED-EVENT-LISTENER")
public class VoucherGrantedEventListener {

    private final NotificationService notificationService;

    @Async
    @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT)
    public void handle(VoucherGrantedEvent event) {
        log.info("Handling VoucherGrantedEvent for userVoucher id {}", event.userVoucherId());
        notificationService.notifyVoucherGranted(event.userVoucherId());
    }
}
