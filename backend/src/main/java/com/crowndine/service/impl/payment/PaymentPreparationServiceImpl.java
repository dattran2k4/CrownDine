package com.crowndine.service.impl.payment;

import com.crowndine.common.enums.*;
import com.crowndine.common.utils.CodeUtils;
import com.crowndine.dto.request.PaymentRequest;
import com.crowndine.exception.InvalidDataException;
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
        payment.setCreatedBy(user);
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
        log.info("Order {} final price used for deposit calculation: {}", order.getId(), finalOrderPrice);
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
        log.info("Order final price: {}", amountToPay);

        //Check order has reservation
        if (order.getReservation() != null) {
            BigDecimal totalDeposited = paymentRepository.sumAmountByTargetAndReservationIdAndStatus(EPaymentTarget.RESERVATION, order.getReservation().getId(), EPaymentStatus.SUCCESS);

            amountToPay = amountToPay.subtract(totalDeposited);
            log.info("Order {} - Total: {}, Deposit: {}, Remaining: {}",
                    order.getId(), order.getFinalPrice(), totalDeposited, amountToPay);
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
        return calculationService.calculateTableDeposit(table != null ? table.getBaseDeposit() : null, reservation.getStartTime(), reservation.getEndTime());
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
