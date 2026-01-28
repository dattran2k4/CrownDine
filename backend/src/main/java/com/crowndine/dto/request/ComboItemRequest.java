package com.crowndine.dto.request;

import jakarta.validation.constraints.NotNull;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ComboItemRequest {

    @NotNull(message = "ItemId không được null")
    private Long itemId;

    @NotNull(message = "Số lượng không được null")
    private Integer quantity;
}
