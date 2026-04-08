package com.crowndine.core.service.impl.payment;

import com.crowndine.common.enums.*;
import com.crowndine.common.utils.CodeUtils;
import com.crowndine.presentation.dto.request.PaymentRequest;
import com.crowndine.presentation.exception.InvalidDataException;
import com.crowndine.core.entity.Order;
import com.crowndine.core.entity.OrderDetail;
import com.crowndine.core.entity.Payment;
import com.crowndine.core.entity.Reservation;
import com.crowndine.core.entity.RestaurantTable;
import com.crowndine.core.entity.User;
import com.crowndine.core.repository.PaymentRepository;
import com.crowndine.core.service.CalculationService;
import com.crowndine.core.service.order.OrderService;
import com.crowndine.core.service.payment.PaymentPreparationService;
import com.crowndine.core.service.payment.PreparedPayment;
import com.crowndine.core.service.reservation.ReservationService;
import com.crowndine.core.service.user.UserService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.math.BigDecimal;
import java.math.RoundingMode;
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

        Payment payment = initPayment(user, method, initialStatus);
        PreparedPayment preparedPayment = hasReservation ? prepareReservationPayment(request, payment) : prepareOrderPayment(request, payment);

        validatePositiveAmount(preparedPayment.amount());
        preparedPayment.payment().setAmount(preparedPayment.amount());

        Payment savedPayment = paymentRepository.save(preparedPayment.payment());
        log.info("Payment id {} saved with status={}, target={}", savedPayment.getId(), savedPayment.getStatus(), savedPayment.getTarget());

        return new PreparedPayment(savedPayment, preparedPayment.amount(), preparedPayment.description());
    }

    private Payment initPayment(User user, EPaymentMethod method, EPaymentStatus initialStatus) {
        Payment payment = new Payment();
        payment.setStatus(initialStatus);
        payment.setMethod(method);
        payment.setUser(user);
        payment.setCode(CodeUtils.generatePaymentCode());
        return payment;
    }

    private PreparedPayment prepareReservationPayment(PaymentRequest request, Payment payment) {
        log.info("Preparing reservation payment for reservation code {}", request.getReservationCode());
        Reservation reservation = reservationService.getReservationByCode(request.getReservationCode());
        validateReservationForPayment(reservation);

        payment.setReservation(reservation);
        payment.setTarget(EPaymentTarget.RESERVATION);
        payment.setSource(EPaymentSource.CLIENT_APP);
        payment.setType(EPaymentType.DEPOSIT);

        Order order = reservation.getOrder();
        BigDecimal finalOrderPrice = getReservationOrderFinalPrice(order);
        if (order != null) {
            log.info("Order {} final price used for reservation deposit calculation: {}", order.getId(), finalOrderPrice);
        } else {
            log.info("Reservation {} has no order. Using final order price {} for reservation deposit calculation",
                    reservation.getId(), finalOrderPrice);
        }
        BigDecimal tableDeposit = calculateTableDeposit(reservation);
        log.info("Reservation {} table {} deposit amount: {}", reservation.getId(), reservation.getTable().getId(), tableDeposit);
        BigDecimal amountToPay = calculationService.calculateDepositPayment(finalOrderPrice, tableDeposit);
        log.info("Reservation {} deposit payment amount calculated from final order price {} and table deposit {}: {}",
                reservation.getId(), finalOrderPrice, tableDeposit, amountToPay);

        return new PreparedPayment(payment, amountToPay, "Thanh toán đặt cọc bàn");
    }

    private PreparedPayment prepareOrderPayment(PaymentRequest request, Payment payment) {
        log.info("Preparing order payment for order code {}", request.getOrderCode());
        Order order = orderService.getOrderByCode(request.getOrderCode());
        validateOrderForPayment(order);

        payment.setOrder(order);
        payment.setTarget(EPaymentTarget.ORDER);
        payment.setSource(EPaymentSource.POS_COUNTER);
        payment.setType(EPaymentType.SETTLEMENT);

        BigDecimal amountToPay = order.getFinalPrice();
        log.info("Order {} final price before settlement adjustment: {}", order.getId(), amountToPay);

        if (order.getReservation() != null) {
            boolean hasSuccessfulReservationDeposit = paymentRepository.existsByTargetAndReservationIdAndStatus(
                    EPaymentTarget.RESERVATION, order.getReservation().getId(), EPaymentStatus.SUCCESS);

            if (hasSuccessfulReservationDeposit) {
                BigDecimal orderDepositPaid = calculateOrderDepositPaid(order);
                amountToPay = amountToPay.subtract(orderDepositPaid);
                log.info("Order {} settlement subtracts only order deposit {} from final price {}. Table deposit is retained by the restaurant. Remaining amount to collect: {}",
                        order.getId(), orderDepositPaid, order.getFinalPrice(), amountToPay);
            } else {
                log.info("Order {} has reservation {} but no successful reservation deposit payment. Remaining amount stays at final price {}",
                        order.getId(), order.getReservation().getId(), amountToPay);
            }
        }

        return new PreparedPayment(payment, amountToPay, "Thanh toán đơn hàng");
    }

    private BigDecimal getReservationOrderFinalPrice(Order order) {
        if (order == null) {
            log.info("Reservation has no order. Using 0 as final order price for deposit calculation");
            return BigDecimal.ZERO;
        }

        if (order.getFinalPrice() != null) {
            log.info("Using persisted final price {} for order {}", order.getFinalPrice(), order.getId());
            return order.getFinalPrice();
        }

        List<OrderDetail> orderDetails = order.getOrderDetails();
        if (orderDetails == null) {
            log.info("Order {} has no order details. Using 0 as final order price for deposit calculation", order.getId());
            return BigDecimal.ZERO;
        }

        BigDecimal recalculatedFinalPrice = calculationService.calculateTotalOrder(orderDetails);
        log.warn("Order {} finalPrice is null. Falling back to recalculated amount from order details: {}",
                order.getId(), recalculatedFinalPrice);
        return recalculatedFinalPrice;
    }

    private BigDecimal calculateTableDeposit(Reservation reservation) {
        RestaurantTable table = reservation.getTable();
        return calculationService.calculateTableDeposit(table != null ? table.getBaseDeposit() : null);
    }

    private BigDecimal calculateOrderDepositPaid(Order order) {
        BigDecimal finalOrderPrice = getReservationOrderFinalPrice(order);
        BigDecimal orderDepositPaid = finalOrderPrice.multiply(new BigDecimal("0.20")).setScale(2, RoundingMode.HALF_UP);
        log.info("Calculated paid order deposit for order {} as 20% of final price {}: {}",
                order.getId(), finalOrderPrice, orderDepositPaid);
        return orderDepositPaid;
    }

    private void validatePositiveAmount(BigDecimal amountToPay) {
        if (amountToPay == null || amountToPay.compareTo(BigDecimal.ZERO) <= 0) {
            throw new InvalidDataException("Số tiền thanh toán phải lớn hơn 0");
        }
    }

    private void validateReservationForPayment(Reservation reservation) {
        if (reservation.getStatus().isFinal() || reservation.getStatus() == EReservationStatus.CHECKED_IN || reservation.getStatus() == EReservationStatus.CONFIRMED) {
            throw new InvalidDataException("Trạng thái đặt bàn hiện tại không thể tạo thanh toán");
        }

        boolean alreadyPaidDeposit = paymentRepository.existsByTargetAndReservationIdAndStatus(EPaymentTarget.RESERVATION, reservation.getId(), EPaymentStatus.SUCCESS);

        if (alreadyPaidDeposit) {
            throw new InvalidDataException("Đặt bàn này đã thanh toán cọc");
        }
    }

    private void validateOrderForPayment(Order order) {
        if (order.getStatus().isFinal()) {
            throw new InvalidDataException("Trạng thái đơn hàng hiện tại không thể tạo thanh toán");
        }

        boolean alreadyPaidOrder = paymentRepository.existsByTargetAndOrderIdAndStatus(EPaymentTarget.ORDER, order.getId(), EPaymentStatus.SUCCESS);

        if (alreadyPaidOrder) {
            throw new InvalidDataException("Đơn hàng này đã được thanh toán");
        }

        if (order.getFinalPrice() == null || order.getFinalPrice().compareTo(BigDecimal.ZERO) <= 0) {
            throw new InvalidDataException("Đơn hàng không có số tiền hợp lệ để thanh toán");
        }
    }
}
