package com.crowndine.controller;

import com.crowndine.common.enums.ETableStatus;
import com.crowndine.dto.response.RestaurantTableResponse;
import com.crowndine.service.layout.RestaurantTableService;
import jakarta.validation.constraints.Min;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.stereotype.Controller;

@Controller
@RequiredArgsConstructor
@Slf4j(topic = "WEBSOCKET-CONTROLLER")
public class WebSocketOrderController {

    private final RestaurantTableService restaurantTableService;

    //Cập nhật status bàn
    @MessageMapping("/table/{id}")
    @SendTo("/topic/tables")
    public RestaurantTableResponse updateStatusTable(@Min(1) @DestinationVariable Long id, ETableStatus status) {
        log.info("Received request to update table with id {}", id);
        log.info("Received request to update table with status {}", status);
        return restaurantTableService.updateTableStatus(id, status);
    }

    //Cập nhật order detail


    //Nhắn tin

    
}
