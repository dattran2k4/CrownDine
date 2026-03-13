package com.crowndine.service.impl.payment;

import com.crowndine.common.enums.*;
import com.crowndine.common.utils.CodeUtils;
import com.crowndine.dto.request.PaymentRequest;
import com.crowndine.model.Order;
import com.crowndine.model.OrderDetail;
import com.crowndine.model.Payment;
import com.crowndine.model.Reservation;
import com.crowndine.model.RestaurantTable;
import com.crowndine.model.User;
import com.crowndine.repository.PaymentRepository;
import com.crowndine.service.CalculationService;
import com.crowndine.service.order.OrderService;
import com.crowndine.service.payment.PaymentPreparationService;
import com.crowndine.service.payment.PreparedPayment;
import com.crowndine.service.reservation.ReservationService;
import com.crowndine.service.user.UserService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.math.BigDecimal;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j(topic = "PAYMENT-PREPARATION")
public class PaymentPreparationServiceImpl implements PaymentPreparationService {

    private final PaymentRepository paymentRepository;
    private final ReservationService reservationService;
    private final OrderService orderService;
    private final UserService userService;
    private final CalculationService calculationService;

    @Override
    @Transactional(rollbackFor = Exception.class)
    public PreparedPayment prepare(PaymentRequest request, String username, EPaymentMethod method, EPaymentStatus initialStatus) {
        boolean hasReservation = StringUtils.hasText(request.getReservationCode());

        User user = userService.getUserByUserName(username);

        Payment payment = new Payment();
        payment.setStatus(initialStatus);
        payment.setMethod(method);
        payment.setCreatedBy(user);

        Long code = CodeUtils.generatePaymentCode();
        payment.setCode(code);

        BigDecimal amountToPay;
        String description;

        if (hasReservation) {
            Reservation reservation = reservationService.getReservationByCode(request.getReservationCode());
            payment.setReservation(reservation);
            payment.setTarget(EPaymentTarget.RESERVATION);
            payment.setSource(EPaymentSource.CLIENT_APP);
            payment.setType(EPaymentType.DEPOSIT);

            Order order = reservation.getOrder();
            RestaurantTable table = reservation.getTable();

            BigDecimal totalOrder = BigDecimal.ZERO;
            if (order != null) {
                List<OrderDetail> orderDetails = order.getOrderDetails();
                if (orderDetails != null) {
                    totalOrder = calculationService.calculateTotalOrder(orderDetails);
                }
            }

            BigDecimal tableDeposit = calculationService.calculateTableDeposit(
                    table != null ? table.getBaseDeposit() : null,
                    reservation.getStartTime(),
                    reservation.getEndTime()
            );

            amountToPay = calculationService.calculateDepositPayment(totalOrder, tableDeposit);

            if (order != null && order.getVoucher() != null) {
                BigDecimal discount = calculationService.calculateVoucherDiscount(amountToPay, order.getVoucher());
                amountToPay = amountToPay.subtract(discount);
            }

            log.info("Table deposit (total): {}", tableDeposit);
            log.info("Total amount to pay: {}", amountToPay);

            description = "Thanh toán đặt cọc bàn";
        } else {
            Order order = orderService.getOrderByCode(request.getOrderCode());
            payment.setOrder(order);
            payment.setTarget(EPaymentTarget.ORDER);
            payment.setSource(EPaymentSource.POS_COUNTER);
            payment.setType(EPaymentType.SETTLEMENT);

            amountToPay = order.getFinalPrice();

            if (order.getReservation() != null) {
                BigDecimal totalDeposited = paymentRepository.sumAmountByTargetAndReservationIdAndStatus(
                        EPaymentTarget.RESERVATION,
                        order.getReservation().getId(),
                        EPaymentStatus.SUCCESS
                );

                amountToPay = amountToPay.subtract(totalDeposited);
                log.info("Order {} - Total: {}, Deposit: {}, Remaining: {}",
                        order.getId(), order.getFinalPrice(), totalDeposited, amountToPay);
            }

            description = "Thanh toán đơn hàng";
        }

        payment.setAmount(amountToPay);

        Payment savedPayment = paymentRepository.save(payment);
        log.info("Payment id {} saved with status={}, target={}", savedPayment.getId(), savedPayment.getStatus(), savedPayment.getTarget());

        return new PreparedPayment(savedPayment, amountToPay, description);
    }
}
