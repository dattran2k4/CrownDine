package com.crowndine.service.favorite;

import com.crowndine.dto.response.FavoriteResponse;
import java.util.List;

public interface FavoriteService {
    void addFavoriteItem(Long itemId);
    void removeFavoriteItem(Long itemId);
    void addFavoriteCombo(Long comboId);
    void removeFavoriteCombo(Long comboId);
    List<FavoriteResponse> getMyFavorites();
    boolean isFavoriteItem(Long itemId);
    boolean isFavoriteCombo(Long comboId);
}
