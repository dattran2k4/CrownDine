package com.crowndine.dto.request;

import jakarta.validation.constraints.Future;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;

import java.time.LocalDateTime;
import java.util.List;

@Getter
public class VoucherAssignUsersRequest {

    @NotEmpty(message = "Danh sách user không được để trống")
    private List<@NotNull @Min(value = 1, message = "User id phải lớn hơn 0") Long> userIds;

    @Min(value = 1, message = "Giới hạn sử dụng phải lớn hơn 0")
    private Integer usageLimit;

    @Future(message = "Thời gian hết hạn phải sau thời điểm hiện tại")
    private LocalDateTime expiredAt;
}
