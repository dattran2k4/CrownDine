package com.crowndine.service.payment;

import com.crowndine.common.enums.EPaymentMethod;
import com.crowndine.common.enums.EPaymentStatus;
import com.crowndine.dto.request.PaymentRequest;
import com.crowndine.exception.InvalidDataException;
import lombok.RequiredArgsConstructor;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

@RequiredArgsConstructor
public abstract class AbstractPaymentStrategy<T> implements PaymentStrategy<T> {

    protected final PaymentPreparationService paymentPreparationService;

    @Override
    @Transactional(rollbackFor = Exception.class)
    public String createPaymentLink(PaymentRequest request, String username) {
        validateRequest(request);
        PreparedPayment prepared = paymentPreparationService.prepare(request, username, getMethod(), getInitialStatus());
        return doCreatePayment(prepared);
    }

    protected void validateRequest(PaymentRequest request) {
        boolean hasReservation = StringUtils.hasText(request.getReservationCode());
        boolean hasOrder = StringUtils.hasText(request.getOrderCode());
        if (hasReservation == hasOrder) {
            throw new InvalidDataException("Chỉ được truyền reservationCode hoặc orderCode");
        }
    }

    protected abstract EPaymentMethod getMethod();

    protected abstract EPaymentStatus getInitialStatus();

    protected abstract String doCreatePayment(PreparedPayment prepared);
}
