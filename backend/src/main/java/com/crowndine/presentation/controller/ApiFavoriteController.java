package com.crowndine.presentation.controller;

import com.crowndine.presentation.dto.response.ApiResponse;
import com.crowndine.presentation.dto.response.FavoriteResponse;
import com.crowndine.core.service.favorite.FavoriteService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.List;

@RestController
@Validated
@RequiredArgsConstructor
@RequestMapping("/api/favorites")
@Slf4j(topic = "API-FAVORITE-CONTROLLER")
public class ApiFavoriteController {

    private final FavoriteService favoriteService;

    @GetMapping
    public ApiResponse getMyFavorites(Principal principal) {
        List<FavoriteResponse> favorites = favoriteService.getMyFavorites(principal.getName());
        return ApiResponse.builder()
                .status(200)
                .message("Lấy danh sách yêu thích thành công")
                .data(favorites)
                .build();
    }

    @PostMapping("/items/{itemId}")
    public ApiResponse addFavoriteItem(@PathVariable Long itemId, Principal principal) {
        favoriteService.addFavoriteItem(itemId, principal.getName());
        return ApiResponse.builder()
                .status(200)
                .message("Đã thêm món ăn vào danh sách yêu thích")
                .build();
    }

    @DeleteMapping("/items/{itemId}")
    public ApiResponse removeFavoriteItem(@PathVariable Long itemId, Principal principal) {
        favoriteService.removeFavoriteItem(itemId, principal.getName());
        return ApiResponse.builder()
                .status(200)
                .message("Đã xóa món ăn khỏi danh sách yêu thích")
                .build();
    }

    @PostMapping("/combos/{comboId}")
    public ApiResponse addFavoriteCombo(@PathVariable Long comboId, Principal principal) {
        favoriteService.addFavoriteCombo(comboId, principal.getName());
        return ApiResponse.builder()
                .status(200)
                .message("Đã thêm combo vào danh sách yêu thích")
                .build();
    }

    @DeleteMapping("/combos/{comboId}")
    public ApiResponse removeFavoriteCombo(@PathVariable Long comboId, Principal principal) {
        favoriteService.removeFavoriteCombo(comboId, principal.getName());
        return ApiResponse.builder()
                .status(200)
                .message("Đã xóa combo khỏi danh sách yêu thích")
                .build();
    }

    @GetMapping("/items/{itemId}/check")
    public ApiResponse isFavoriteItem(@PathVariable Long itemId, Principal principal) {
        boolean isFavorite = favoriteService.isFavoriteItem(itemId, principal.getName());
        return ApiResponse.builder()
                .status(200)
                .message("Kiểm tra yêu thích món ăn")
                .data(isFavorite)
                .build();
    }

    @GetMapping("/combos/{comboId}/check")
    public ApiResponse isFavoriteCombo(@PathVariable Long comboId, Principal principal) {
        boolean isFavorite = favoriteService.isFavoriteCombo(comboId, principal.getName());
        return ApiResponse.builder()
                .status(200)
                .message("Kiểm tra yêu thích combo")
                .data(isFavorite)
                .build();
    }
}
