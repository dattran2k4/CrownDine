package com.crowndine.service.favorite;

import com.crowndine.dto.response.FavoriteResponse;
import java.util.List;

public interface FavoriteService {
    void addFavoriteItem(Long itemId, String username);
    void removeFavoriteItem(Long itemId, String username);
    void addFavoriteCombo(Long comboId, String username);
    void removeFavoriteCombo(Long comboId, String username);
    List<FavoriteResponse> getMyFavorites(String username);
    boolean isFavoriteItem(Long itemId, String username);
    boolean isFavoriteCombo(Long comboId, String username);
}
