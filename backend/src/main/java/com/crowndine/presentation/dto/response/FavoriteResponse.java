package com.crowndine.presentation.dto.response;

import lombok.*;

@Getter
@Setter
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class FavoriteResponse {
    private Long id;
    private ItemResponse item;
    private ComboResponse combo;
}
