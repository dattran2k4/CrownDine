package com.crowndine.core.service.impl.product;

import com.crowndine.core.entity.Combo;
import com.crowndine.core.entity.Item;
import com.crowndine.core.entity.Order;
import com.crowndine.core.entity.OrderDetail;
import com.crowndine.core.repository.ComboRepository;
import com.crowndine.core.repository.ItemRepository;
import com.crowndine.core.repository.OrderRepository;
import com.crowndine.core.service.product.ProductSalesService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
@Slf4j(topic = "PRODUCT-SALES-SERVICE")
public class ProductSalesServiceImpl implements ProductSalesService {

    private final OrderRepository orderRepository;
    private final ItemRepository itemRepository;
    private final ComboRepository comboRepository;

    /**
     * Đồng bộ sold count cho item và combo sau khi order thanh toán thành công.
     *
     * @param orderId id của order đã thanh toán
     */
    @Override
    @Transactional(rollbackFor = Exception.class)
    public void syncSoldCountFromPaidOrder(Long orderId) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new IllegalArgumentException("Order not found for sold-count synchronization: " + orderId));

        List<OrderDetail> orderDetails = order.getOrderDetails();
        if (orderDetails == null || orderDetails.isEmpty()) {
            log.info("Order id {} has no order details. Skipping sold-count synchronization.", orderId);
            return;
        }

        Map<Long, Long> itemSoldDelta = new HashMap<>();
        Map<Long, Long> comboSoldDelta = new HashMap<>();
        collectSoldDeltas(orderDetails, itemSoldDelta, comboSoldDelta);

        updateItemSoldCounts(itemSoldDelta);
        updateComboSoldCounts(comboSoldDelta);

        log.info("Sold-count synchronization completed successfully for order id {}", orderId);
    }

    /**
     * Gom số lượng bán tăng thêm từ order detail cho item và combo.
     */
    private void collectSoldDeltas(List<OrderDetail> orderDetails, Map<Long, Long> itemSoldDelta, Map<Long, Long> comboSoldDelta) {
        for (OrderDetail detail : orderDetails) {
            long quantity = getValidQuantity(detail);
            if (quantity <= 0) {
                continue;
            }

            mergeItemSoldDelta(detail, quantity, itemSoldDelta);
            mergeComboSoldDelta(detail, quantity, comboSoldDelta);
        }
    }

    /**
     * Lấy số lượng hợp lệ của order detail. Null thì trả về 0.
     */
    private long getValidQuantity(OrderDetail detail) {
        return detail.getQuantity() != null ? detail.getQuantity() : 0L;
    }

    /**
     * Cộng dồn số lượng bán cho item.
     */
    private void mergeItemSoldDelta(OrderDetail detail, long quantity, Map<Long, Long> itemSoldDelta) {
        if (detail.getItem() != null) {
            itemSoldDelta.merge(detail.getItem().getId(), quantity, Long::sum);
        }
    }

    /**
     * Cộng dồn số lượng bán cho combo.
     */
    private void mergeComboSoldDelta(OrderDetail detail, long quantity, Map<Long, Long> comboSoldDelta) {
        if (detail.getCombo() != null) {
            comboSoldDelta.merge(detail.getCombo().getId(), quantity, Long::sum);
        }
    }

    /**
     * Cập nhật sold count cho các item có phát sinh bán thêm.
     */
    private void updateItemSoldCounts(Map<Long, Long> itemSoldDelta) {
        if (itemSoldDelta.isEmpty()) {
            return;
        }

        List<Item> itemsToUpdate = itemRepository.findAllById(itemSoldDelta.keySet());
        for (Item item : itemsToUpdate) {
            long currentSoldCount = item.getSoldCount() != null ? item.getSoldCount() : 0L;
            long delta = itemSoldDelta.getOrDefault(item.getId(), 0L);
            item.setSoldCount(currentSoldCount + delta);
            log.info("Item id {} sold count updated from {} to {}", item.getId(), currentSoldCount, item.getSoldCount());
        }
        itemRepository.saveAll(itemsToUpdate);
    }

    /**
     * Cập nhật sold count cho các combo có phát sinh bán thêm.
     */
    private void updateComboSoldCounts(Map<Long, Long> comboSoldDelta) {
        if (comboSoldDelta.isEmpty()) {
            return;
        }

        List<Combo> combosToUpdate = comboRepository.findAllById(comboSoldDelta.keySet());
        for (Combo combo : combosToUpdate) {
            long currentSoldCount = combo.getSoldCount() != null ? combo.getSoldCount() : 0L;
            long delta = comboSoldDelta.getOrDefault(combo.getId(), 0L);
            combo.setSoldCount(currentSoldCount + delta);
            log.info("Combo id {} sold count updated from {} to {}", combo.getId(), currentSoldCount, combo.getSoldCount());
        }
        comboRepository.saveAll(combosToUpdate);
    }
}
