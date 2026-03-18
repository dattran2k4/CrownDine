package com.crowndine.service.product;

public interface ProductSalesService {
    void syncSoldCountFromPaidOrder(Long orderId);
}
