package com.crowndine.dto.response;

import com.crowndine.common.enums.EOrderStatus;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Getter
@Setter
public class OrderResponse {

    private Long id;

    private String tableName;

    private BigDecimal totalPrice;

    private BigDecimal discountPrice;

    private BigDecimal finalPrice;

    private EOrderStatus status;

    private String code;

    private String staffName;

    private String guestName;

    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;

    private List<OrderDetailResponse> orderDetails = new ArrayList<>();

    private VoucherSlimResponse voucher;

    @Getter
    @Setter
    public static class VoucherSlimResponse {
        private Long id;
        private String code;
        private String name;
    }
}
