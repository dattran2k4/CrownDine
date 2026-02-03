package com.crowndine.dto.request;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;

import java.util.List;

@Getter
public class OrderRequest {

    private String voucherCode;

    @NotNull(message = "Chưa có danh sách đồ ăn")
    private List<OrderItemRequest> items;

    @Min(value = 1, message = "Combo không hợp lý")
    private Long comboId;

    @Min(value = 1, message = "Đơn đặt bàn không hợp lý")
    private Long reservationId;

    @Min(value = 1, message = "Bàn không hợp lý")
    private Long tableId;
}
