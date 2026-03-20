package com.crowndine.controller;

import com.crowndine.dto.response.ApiResponse;
import com.crowndine.dto.response.FavoriteResponse;
import com.crowndine.service.favorite.FavoriteService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@Validated
@RequiredArgsConstructor
@RequestMapping("/api/favorites")
@Slf4j(topic = "API-FAVORITE-CONTROLLER")
public class ApiFavoriteController {

    private final FavoriteService favoriteService;

    @GetMapping
    public ApiResponse getMyFavorites() {
        List<FavoriteResponse> favorites = favoriteService.getMyFavorites();
        return ApiResponse.builder()
                .status(200)
                .message("Lấy danh sách yêu thích thành công")
                .data(favorites)
                .build();
    }

    @PostMapping("/items/{itemId}")
    public ApiResponse addFavoriteItem(@PathVariable Long itemId) {
        favoriteService.addFavoriteItem(itemId);
        return ApiResponse.builder()
                .status(200)
                .message("Đã thêm món ăn vào danh sách yêu thích")
                .build();
    }

    @DeleteMapping("/items/{itemId}")
    public ApiResponse removeFavoriteItem(@PathVariable Long itemId) {
        favoriteService.removeFavoriteItem(itemId);
        return ApiResponse.builder()
                .status(200)
                .message("Đã xóa món ăn khỏi danh sách yêu thích")
                .build();
    }

    @PostMapping("/combos/{comboId}")
    public ApiResponse addFavoriteCombo(@PathVariable Long comboId) {
        favoriteService.addFavoriteCombo(comboId);
        return ApiResponse.builder()
                .status(200)
                .message("Đã thêm combo vào danh sách yêu thích")
                .build();
    }

    @DeleteMapping("/combos/{comboId}")
    public ApiResponse removeFavoriteCombo(@PathVariable Long comboId) {
        favoriteService.removeFavoriteCombo(comboId);
        return ApiResponse.builder()
                .status(200)
                .message("Đã xóa combo khỏi danh sách yêu thích")
                .build();
    }

    @GetMapping("/items/{itemId}/check")
    public ApiResponse isFavoriteItem(@PathVariable Long itemId) {
        boolean isFavorite = favoriteService.isFavoriteItem(itemId);
        return ApiResponse.builder()
                .status(200)
                .message("Kiểm tra yêu thích món ăn")
                .data(isFavorite)
                .build();
    }

    @GetMapping("/combos/{comboId}/check")
    public ApiResponse isFavoriteCombo(@PathVariable Long comboId) {
        boolean isFavorite = favoriteService.isFavoriteCombo(comboId);
        return ApiResponse.builder()
                .status(200)
                .message("Kiểm tra yêu thích combo")
                .data(isFavorite)
                .build();
    }
}
