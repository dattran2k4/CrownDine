package com.crowndine.controller;

import com.crowndine.dto.response.ApiResponse;
import com.crowndine.service.item.ItemService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.math.BigDecimal;
import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/items")
@Slf4j(topic = "API-ITEM-CONTROLLER")
public class ApiItemController {

    private final ItemService itemService;


    @GetMapping
    public ApiResponse getAllItems(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(required = false) String sort
    ) {
        Sort sortObj = buildPriceSort(sort);
        Pageable pageable = PageRequest.of(page, size, sortObj);
        return ApiResponse.builder()
                .status(200)
                .message("Get list items successfully")
                .data(itemService.findAllItems(pageable))
                .build();
    }

    private Sort buildPriceSort(String sort) {
        if ("price_asc".equalsIgnoreCase(sort)) {
            return Sort.by(Sort.Direction.ASC, "price");
        }
        if ("price_desc".equalsIgnoreCase(sort)) {
            return Sort.by(Sort.Direction.DESC, "price");
        }
        return Sort.unsorted();
    }

    @GetMapping("/search")
    public ApiResponse searchItems(
        @RequestParam(required = false) String name,
        @RequestParam(defaultValue = "0") int page,
        @RequestParam(defaultValue = "10") int size
     ){
        Pageable pageable = PageRequest.of(page, size);
        return ApiResponse.builder()
                .status(200)
                .message("Search items successfully")
                .data(itemService.searchItems(name, pageable))
                .build();
    }

    @GetMapping("/by-category")
    public ApiResponse getItemsByCategory(
            @RequestParam Long categoryId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size
    ) {
        Pageable pageable = PageRequest.of(page, size);
        return ApiResponse.builder()
                .status(200)
                .message("Get items by category successfully")
                .data(itemService.filterByCategory(categoryId, pageable))
                .build();
    }
}