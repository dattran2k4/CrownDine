package com.crowndine.core.service.product;

public interface ProductSalesService {
    void syncSoldCountFromPaidOrder(Long orderId);
}
