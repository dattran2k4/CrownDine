package com.crowndine.dto.request;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class VerifyEmailOtpRequest {
    @NotBlank(message = "OTP không được để trống")
    private String otp;

    @NotBlank(message = "Email mới không được để trống")
    @Email(message = "Email không đúng định dạng")
    private String newEmail;
}
