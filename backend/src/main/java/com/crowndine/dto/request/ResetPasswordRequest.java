package com.crowndine.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.Getter;

@Getter
public class ResetPasswordRequest {
    @NotBlank(message = "{validation.reset_password.password.not_blank}")
    private String password;

    @NotBlank(message = "{validation.reset_password.confirm_password.not_blank}")
    private String confirmPassword;
}
