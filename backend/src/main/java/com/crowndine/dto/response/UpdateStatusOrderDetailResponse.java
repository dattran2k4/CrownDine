package com.crowndine.dto.response;

import com.crowndine.common.enums.EOrderDetailStatus;
import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Builder
public class UpdateStatusOrderDetailResponse {
    private Long id;
    private EOrderDetailStatus status;
}
