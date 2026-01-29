package com.crowndine.dto.response;

import lombok.*;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ComboItemResponse {
private Long itemId;
private String itemName;
private Integer quantity;
}
