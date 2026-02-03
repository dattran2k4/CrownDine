package com.crowndine.service.impl.order;

import com.crowndine.common.enums.EVoucherType;
import com.crowndine.model.Order;
import com.crowndine.model.OrderDetail;
import com.crowndine.model.Voucher;
import com.crowndine.service.order.OrderService;
import com.crowndine.service.voucher.VoucherService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.apache.commons.lang3.StringUtils;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.List;
import java.util.Objects;

@Service
@RequiredArgsConstructor
@Slf4j(topic = "PRICE-CALCULATOR-SERVICE")
public class PriceCalculatorService {

    public void calculateTotalPrice(Order order) {
        log.info("Calculating price for orderId {}", order.getId());
        if (order == null || order.getOrderDetails() == null) return;

        // 1. Tính Subtotal (Tổng tiền trước giảm giá)
        BigDecimal subTotal = order.getOrderDetails().stream()
                .map(detail -> {
                    BigDecimal price = detail.getItem().getPrice() != null ? detail.getItem().getPrice() : BigDecimal.ZERO;
                    return price.multiply(BigDecimal.valueOf(detail.getQuantity()));
                })
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        log.info("Subtotal: {}", subTotal);

        order.setTotalPrice(subTotal);
        log.info("Total price: {}", order.getTotalPrice());

        // 2. Tính Discount (Tiền giảm giá từ Voucher)
        BigDecimal discount = BigDecimal.ZERO;
        if (order.getVoucher() != null) {
            discount = calculateVoucherDiscount(order.getVoucher(), subTotal);
        }
        order.setDiscountPrice(discount);
        log.info("Discount price: {}", order.getDiscountPrice());

        // 3. Tính Final Price (Tổng cuối cùng)
        // Dùng .max(BigDecimal.ZERO) để đảm bảo không bị âm nếu voucher giảm quá tay
        BigDecimal finalPrice = subTotal.subtract(discount).max(BigDecimal.ZERO);
        order.setFinalPrice(finalPrice);
        log.info("Final price: {}", finalPrice);
    }

    private BigDecimal calculateSubTotal(List<OrderDetail> details) {
        if (details == null || details.isEmpty()) {
            return BigDecimal.ZERO;
        }

        return details.stream()
                .filter(Objects::nonNull)
                .map(detail -> {
                    BigDecimal price = detail.getItem().getPrice() != null ? detail.getItem().getPrice() : BigDecimal.ZERO;
                    BigDecimal quantity = BigDecimal.valueOf(detail.getQuantity());
                    return price.multiply(quantity);
                })
                .reduce(BigDecimal.ZERO, BigDecimal::add);
    }

    private BigDecimal calculateVoucherDiscount(Voucher voucher, BigDecimal subTotal) {
        // Kiểm tra điều kiện đơn hàng tối thiểu
//        if (voucher.getMinOrderValue() != null && subTotal.compareTo(voucher.getMinOrderValue()) < 0) {
//            return BigDecimal.ZERO;
//        }

        BigDecimal discountAmount = BigDecimal.ZERO;

        if (voucher.getType() == EVoucherType.PERCENTAGE) {
            // Giảm theo %: subTotal * (value / 100)
            discountAmount = subTotal.multiply(voucher.getDiscountValue())
                    .divide(new BigDecimal("100"), RoundingMode.HALF_UP);

            // Chặn mức giảm tối đa (Max Discount)
//            if (voucher.getMaxDiscount() != null && discountAmount.compareTo(voucher.getMaxDiscount()) > 0) {
//                discountAmount = voucher.getMaxDiscount();
//            }
        } else if (voucher.getType() == EVoucherType.FIXED_AMOUNT) {
            // Giảm tiền mặt cố định
            discountAmount = voucher.getDiscountValue();
        }

        return discountAmount;
    }
}
