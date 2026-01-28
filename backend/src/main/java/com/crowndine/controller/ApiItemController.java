package com.crowndine.controller;

import com.crowndine.dto.request.CategoryRequest;
import com.crowndine.dto.request.ItemRequest;
import com.crowndine.dto.response.ApiResponse;
import com.crowndine.dto.response.CategoryResponse;
import com.crowndine.dto.response.ItemResponse;
import com.crowndine.model.Item;
import com.crowndine.service.item.ItemService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/items")
@RequiredArgsConstructor
@Validated
@Slf4j(topic = "API-ITEM-CONTROLLER")
public class ApiItemController {

    private final ItemService itemService;

    @GetMapping
    public ApiResponse getAllItems() {
        log.info("Get all items request");
        List<ItemResponse> items = itemService.getAlItems();
        return ApiResponse.builder().status(HttpStatus.OK.value()).message("Lấy danh sách item thành công").data(items).build();
    }

    @GetMapping("/{id}")
    public ApiResponse getItemById(@PathVariable Long id) {
        log.info("Get item request with id: {}", id);
        ItemResponse item = itemService.getItemById(id);
        return ApiResponse.builder()
                .status(HttpStatus.OK.value())
                .message("Lấy thông tin item thành công")
                .data(item)
                .build();
    }

    @GetMapping("/name/{name}")
    public ApiResponse getItemByName(@PathVariable String name) {
        log.info("Get item request with name: {}", name);
        ItemResponse item = itemService.getItemByName(name);
        return ApiResponse.builder()
                .status(HttpStatus.OK.value())
                .message("Lấy thông tin item thành công")
                .data(item)
                .build();

    }

    @PostMapping
    public ApiResponse createItem(@Valid @RequestBody ItemRequest request) {
        log.info("Create item request: {}", request.getName());
        ItemResponse item = itemService.createItem(request);
        return ApiResponse.builder()
                .status(HttpStatus.CREATED.value())
                .message("Tạo danh mục thành công")
                .data(item)
                .build();
    }

    @PutMapping("/{id}")
    public ApiResponse updateItem(@PathVariable Long id, @Valid @RequestBody ItemRequest request) {
        log.info("Update item request id: {}", id);
        ItemResponse item = itemService.updateItem(id, request);
        return ApiResponse.builder()
                .status(HttpStatus.OK.value())
                .message("Cập nhật danh mục thành công")
                .data(item)
                .build();
    }

    @DeleteMapping("/{id}")
    public ApiResponse deleteItem(@PathVariable Long id) {
        log.info("Delete Item request id: {}", id);
        itemService.deleteItem(id);
        return ApiResponse.builder()
                .status(HttpStatus.OK.value())
                .message("Xóa danh mục thành công")
                .build();
    }
}
