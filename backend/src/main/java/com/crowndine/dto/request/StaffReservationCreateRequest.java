package com.crowndine.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Getter;

@Getter
public class StaffReservationCreateRequest extends ReservationCreateRequest {
    @NotBlank(message = "Staff phải nhập tên khách vãng lai")
    @Size(max = 100, message = "Tên khách vãng lai không được vượt quá 100 ký tự")
    private String guestName;
}
