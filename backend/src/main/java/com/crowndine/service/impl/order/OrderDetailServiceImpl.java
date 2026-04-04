package com.crowndine.service.impl.order;

import com.crowndine.common.enums.EOrderDetailStatus;
import com.crowndine.common.enums.EOrderStatus;
import com.crowndine.dto.request.OrderItemRequest;
import com.crowndine.dto.request.UpdateOrderDetailRequest;
import com.crowndine.dto.response.UpdateStatusOrderDetailResponse;
import com.crowndine.exception.InvalidDataException;
import com.crowndine.exception.ResourceNotFoundException;
import com.crowndine.model.Order;
import com.crowndine.model.OrderDetail;
import com.crowndine.repository.ComboRepository;
import com.crowndine.repository.ItemRepository;
import com.crowndine.repository.OrderDetailRepository;
import com.crowndine.service.CalculationService;
import com.crowndine.service.order.OrderDetailService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j(topic = "ORDER-DETAIL-SERVICE")
public class OrderDetailServiceImpl implements OrderDetailService {

    private final OrderDetailRepository orderDetailRepository;
    private final ItemRepository itemRepository;
    private final ComboRepository comboRepository;

    private final CalculationService calculationService;

    @Override
    @Transactional(rollbackFor = Exception.class)
    public void createPendingOrderDetails(Order order, List<OrderItemRequest> request) {
        log.info("Processing {} items for order {}", request.size(), order.getId());

        List<OrderDetail> newOrderDetails = new ArrayList<>();

        request.forEach(item -> {
            OrderDetail orderDetailItem = new OrderDetail();
            if (item.getItemId() != null) {
                orderDetailItem.setItem(itemRepository.findById(item.getItemId()).orElseThrow(() -> new ResourceNotFoundException("Item Not Found")));
            }
            if (item.getComboId() != null) {
                orderDetailItem.setCombo(comboRepository.findById(item.getComboId()).orElseThrow(() -> new ResourceNotFoundException("Combo Not Found")));
            }

            orderDetailItem.setQuantity(item.getQuantity());
            orderDetailItem.setNote(item.getNote());
            orderDetailItem.setStatus(EOrderDetailStatus.PENDING);
            orderDetailItem.calculateAndSetTotalPrice();
            order.addOrderDetail(orderDetailItem);
            newOrderDetails.add(orderDetailItem);
            log.info("Added order detail for order {}", order.getId());
        });

        orderDetailRepository.saveAll(newOrderDetails);

        log.info("Added successfully order detail for order {}", order.getId());
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public void updateOrderDetail(Long id, UpdateOrderDetailRequest request) {
        OrderDetail orderDetail = findById(id);

        Order order = orderDetail.getOrder();

        if (order.getStatus().equals(EOrderStatus.COMPLETED) ||
                order.getStatus().equals(EOrderStatus.CANCELLED)) {
            throw new InvalidDataException("Đơn hàng đã kết thúc, không thể chỉnh sửa.");
        }


        if (orderDetail.getStatus().equals(EOrderDetailStatus.COOKING) ||
                orderDetail.getStatus().equals(EOrderDetailStatus.SERVED)) {
            throw new InvalidDataException("Món ăn đã được chế biến hoặc phục vụ, không thể thay đổi số lượng.");
        }

        BigDecimal oldOrderDetailTotalPrice = orderDetail.getTotalPrice();

        orderDetail.setNote(request.getNote());
        orderDetail.setQuantity(request.getQuantity());
        orderDetail.calculateAndSetTotalPrice();

        BigDecimal oldTotalPrice = order.getTotalPrice();
        BigDecimal newOrderDetailTotalPrice = orderDetail.getTotalPrice();

        //HĐ MỚI = HĐ CŨ + (DETAIL MỚI - DETAIL CŨ)
        BigDecimal newOrderTotalPrice = oldTotalPrice.add(newOrderDetailTotalPrice.subtract(oldOrderDetailTotalPrice));

        order.setTotalPrice(newOrderTotalPrice);

        orderDetailRepository.save(orderDetail);
        log.info("Updated successfully order detail for order {}", order.getId());
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public void deleteOrderDetail(Long id) {
        OrderDetail detail = findById(id);
        Order order = detail.getOrder();

        if (detail.getStatus().equals(EOrderDetailStatus.COOKING) ||
                detail.getStatus().equals(EOrderDetailStatus.SERVED) ||
                detail.getStatus().equals(EOrderDetailStatus.CANCELLED)) {
            throw new InvalidDataException("Không thể xóa món khi đơn hàng đang ở trạng thái này.");
        }

        order.getOrderDetails().remove(detail);
        orderDetailRepository.delete(detail);

        order.setTotalPrice(calculationService.calculateTotalOrder(order.getOrderDetails()));
        order.setFinalPrice(order.getTotalPrice());
        log.info("Deleted successfully order detail id {}", id);
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public UpdateStatusOrderDetailResponse changeStatus(Long id, EOrderDetailStatus status) {
        OrderDetail detail = findById(id);
        detail.setStatus(status);
        orderDetailRepository.save(detail);
        log.info("Updated successfully order detail id {}", id);

        return UpdateStatusOrderDetailResponse.builder().id(id).status(status).build();
    }


    private OrderDetail findById(Long id) {
        return orderDetailRepository.findById(id).orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy món ăn trong đơn hàng"));
    }
}
