package com.crowndine.presentation.controller;

import com.crowndine.presentation.dto.request.CategoryRequest;
import com.crowndine.presentation.dto.response.ApiResponse;
import com.crowndine.presentation.dto.response.CategoryResponse;
import com.crowndine.core.service.category.CategoryService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/categories")
@RequiredArgsConstructor
@Validated
@Slf4j(topic = "API-CATEGORY-CONTROLLER")
public class ApiCategoryController {

    private final CategoryService categoryService;

    @GetMapping
    public ApiResponse getAllCategories() {
        log.info("Get all categories request");
        List<CategoryResponse> categories = categoryService.getAllCategories();
        return ApiResponse.builder()
                .status(HttpStatus.OK.value())
                .message("Lấy danh sách danh mục thành công")
                .data(categories)
                .build();
    }

    @GetMapping("/{id}")
    public ApiResponse getCategoryById(@PathVariable Long id) {
        log.info("Get category request with id: {}", id);
        CategoryResponse category = categoryService.getCategoryById(id);
        return ApiResponse.builder()
                .status(HttpStatus.OK.value())
                .message("Lấy thông tin danh mục thành công")
                .data(category)
                .build();
    }

    @PostMapping
    public ApiResponse createCategory(@Valid @RequestBody CategoryRequest request) {
        log.info("Create category request: {}", request.getName());
        CategoryResponse category = categoryService.createCategory(request);
        return ApiResponse.builder()
                .status(HttpStatus.CREATED.value())
                .message("Tạo danh mục thành công")
                .data(category)
                .build();
    }

    @PutMapping("/{id}")
    public ApiResponse updateCategory(@PathVariable Long id, @Valid @RequestBody CategoryRequest request) {
        log.info("Update category request id: {}", id);
        CategoryResponse category = categoryService.updateCategory(id, request);
        return ApiResponse.builder()
                .status(HttpStatus.OK.value())
                .message("Cập nhật danh mục thành công")
                .data(category)
                .build();
    }

    @DeleteMapping("/{id}")
    public ApiResponse deleteCategory(@PathVariable Long id) {
        log.info("Delete category request id: {}", id);
        categoryService.deleteCategory(id);
        return ApiResponse.builder()
                .status(HttpStatus.OK.value())
                .message("Xóa danh mục thành công")
                .build();
    }
}
