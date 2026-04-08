package com.crowndine.presentation.dto.response;

import com.crowndine.common.enums.EOrderStatus;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class UpdateStatusOrderResponse {
    private Long id;
    private EOrderStatus status;
}
