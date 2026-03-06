package com.crowndine.controller;

import com.crowndine.common.enums.EOrderStatus;
import com.crowndine.common.enums.ETableStatus;
import com.crowndine.dto.response.RestaurantTableResponse;
import com.crowndine.dto.response.UpdateStatusOrderResponse;
import com.crowndine.service.layout.RestaurantTableService;
import com.crowndine.service.order.OrderService;
import jakarta.validation.constraints.Min;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.stereotype.Controller;

import java.security.Principal;

@Controller
@RequiredArgsConstructor
@Slf4j(topic = "WEBSOCKET-CONTROLLER")
public class WebSocketOrderController {

    private final RestaurantTableService restaurantTableService;
    private final OrderService orderService;

    //Cập nhật status bàn
    @MessageMapping("/table/{id}")
    @SendTo("/topic/tables")
    public RestaurantTableResponse updateStatusTable(@Min(1) @DestinationVariable Long id, ETableStatus status) {
        log.info("Received request to update table with id {}", id);
        log.info("Received request to update table with status {}", status);
        return restaurantTableService.updateTableStatus(id, status);
    }

    //Cập nhật status order
    @MessageMapping("/order/{id}/upd-status")
    @SendTo("/topic/orders")
    public UpdateStatusOrderResponse updateStatusOrder(@Min(1) @DestinationVariable Long id, EOrderStatus status) {
        log.info("Received request to update order with id {}", id);
        log.info("Received request to update order with status {}", status);
        return orderService.updateOrderStatus(id, status);
    }

    //Cập nhật order detail


    //Nhắn tin


}
