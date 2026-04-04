package com.crowndine.dto.request;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.Getter;

@Getter
public class ForgotPasswordRequest {
    @NotBlank(message = "{validation.forgot_password.email.not_blank}")
    @Email(message = "{validation.forgot_password.email.invalid}")
    private String email;
}
