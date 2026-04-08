package com.crowndine.presentation.dto.request;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class SendEmailOtpRequest {
    @NotBlank(message = "Email mới không được để trống")
    @Email(message = "Email không đúng định dạng")
    private String newEmail;
}
