package com.crowndine.service.impl.favorite;

import com.crowndine.dto.response.ComboResponse;
import com.crowndine.dto.response.FavoriteResponse;
import com.crowndine.dto.response.ItemResponse;
import com.crowndine.exception.ResourceNotFoundException;
import com.crowndine.model.Combo;
import com.crowndine.model.Favorite;
import com.crowndine.model.Item;
import com.crowndine.model.User;
import com.crowndine.repository.ComboRepository;
import com.crowndine.repository.FavoriteRepository;
import com.crowndine.repository.FeedbackRepository;
import com.crowndine.repository.ItemRepository;
import com.crowndine.repository.UserRepository;
import com.crowndine.service.favorite.FavoriteService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j(topic = "FAVORITE-SERVICE")
public class FavoriteServiceImpl implements FavoriteService {

    private final FavoriteRepository favoriteRepository;
    private final UserRepository userRepository;
    private final ItemRepository itemRepository;
    private final ComboRepository comboRepository;
    private final FeedbackRepository feedbackRepository;

    private User getUserByUsername(String username) {
        return userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
    }

    @Override
    @Transactional
    public void addFavoriteItem(Long itemId, String username) {
        User user = getUserByUsername(username);
        Item item = itemRepository.findById(itemId)
                .orElseThrow(() -> new ResourceNotFoundException("Món ăn không tồn tại"));

        if (!favoriteRepository.existsByUserAndItem(user, item)) {
            Favorite favorite = new Favorite();
            favorite.setUser(user);
            favorite.setItem(item);
            favoriteRepository.save(favorite);
            log.info("User {} added item {} to favorites", user.getUsername(), itemId);
        }
    }

    @Override
    @Transactional
    public void removeFavoriteItem(Long itemId, String username) {
        User user = getUserByUsername(username);
        Item item = itemRepository.findById(itemId)
                .orElseThrow(() -> new ResourceNotFoundException("Món ăn không tồn tại"));

        favoriteRepository.findByUserAndItem(user, item)
                .ifPresent(favoriteRepository::delete);
        log.info("User {} removed item {} from favorites", user.getUsername(), itemId);
    }

    @Override
    @Transactional
    public void addFavoriteCombo(Long comboId, String username) {
        User user = getUserByUsername(username);
        Combo combo = comboRepository.findById(comboId)
                .orElseThrow(() -> new ResourceNotFoundException("Combo không tồn tại"));

        if (!favoriteRepository.existsByUserAndCombo(user, combo)) {
            Favorite favorite = new Favorite();
            favorite.setUser(user);
            favorite.setCombo(combo);
            favoriteRepository.save(favorite);
            log.info("User {} added combo {} to favorites", user.getUsername(), comboId);
        }
    }

    @Override
    @Transactional
    public void removeFavoriteCombo(Long comboId, String username) {
        User user = getUserByUsername(username);
        Combo combo = comboRepository.findById(comboId)
                .orElseThrow(() -> new ResourceNotFoundException("Combo không tồn tại"));

        favoriteRepository.findByUserAndCombo(user, combo)
                .ifPresent(favoriteRepository::delete);
        log.info("User {} removed combo {} from favorites", user.getUsername(), comboId);
    }

    @Override
    public List<FavoriteResponse> getMyFavorites(String username) {
        User user = getUserByUsername(username);
        List<Favorite> favorites = favoriteRepository.findAllByUser(user);
        return favorites.stream().map(this::mapToResponse).collect(Collectors.toList());
    }

    @Override
    public boolean isFavoriteItem(Long itemId, String username) {
        User user = getUserByUsername(username);
        Item item = itemRepository.findById(itemId).orElse(null);
        return item != null && favoriteRepository.existsByUserAndItem(user, item);
    }

    @Override
    public boolean isFavoriteCombo(Long comboId, String username) {
        User user = getUserByUsername(username);
        Combo combo = comboRepository.findById(comboId).orElse(null);
        return combo != null && favoriteRepository.existsByUserAndCombo(user, combo);
    }

    private FavoriteResponse mapToResponse(Favorite favorite) {
        FavoriteResponse response = new FavoriteResponse();
        response.setId(favorite.getId());
        if (favorite.getItem() != null) {
            Item item = favorite.getItem();
            response.setItem(ItemResponse.builder()
                    .id(item.getId())
                    .name(item.getName())
                    .description(item.getDescription())
                    .price(item.getPrice())
                    .priceAfterDiscount(item.getPriceAfterDiscount())
                    .imageUrl(item.getImageUrl())
                    .status(item.getStatus())
                    .categoryId(item.getCategory() != null ? item.getCategory().getId() : null)
                    .averageRating(feedbackRepository.getAverageRatingByItemId(item.getId()))
                    .feedbackCount((int) feedbackRepository.countByItem_Id(item.getId()))
                    .createdAt(item.getCreatedAt())
                    .updatedAt(item.getUpdatedAt())
                    .build());
        }
        if (favorite.getCombo() != null) {
            Combo combo = favorite.getCombo();
            response.setCombo(ComboResponse.builder()
                    .id(combo.getId())
                    .name(combo.getName())
                    .description(combo.getDescription())
                    .price(combo.getPrice())
                    .priceAfterDiscount(combo.getPriceAfterDiscount())
                    .imageUrl(combo.getImageUrl())
                    .status(combo.getStatus())
                    .averageRating(feedbackRepository.getAverageRatingByComboId(combo.getId()))
                    .feedbackCount((int) feedbackRepository.countByCombo_Id(combo.getId()))
                    .items(combo.getComboItems() != null ? combo.getComboItems().stream()
                            .map(ci -> com.crowndine.dto.response.ComboItemResponse.builder()
                                    .itemId(ci.getItem().getId())
                                    .itemName(ci.getItem().getName())
                                    .quantity(ci.getQuantity())
                                    .build())
                            .toList() : new java.util.ArrayList<>())
                    .build());
        }
        return response;
    }

}
