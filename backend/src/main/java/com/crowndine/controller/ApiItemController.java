package com.crowndine.controller;

import com.crowndine.dto.response.ApiResponse;
import com.crowndine.service.item.ItemService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Pageable;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/items")
@Slf4j(topic = "API-ITEM-CONTROLLER")
public class ApiItemController {

    private final ItemService itemService;

    @GetMapping
    public ApiResponse getAllItems(Pageable pageable) {
        return ApiResponse.builder()
                .status(200)
                .message("Get list items successfully")
                .data(itemService.findAllItems(pageable))
                .build();
    }
}