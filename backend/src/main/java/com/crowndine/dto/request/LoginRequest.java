package com.crowndine.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.Getter;

@Getter
public class LoginRequest {
    @NotBlank(message = "{validation.login.username.not_blank}")
    private String username;
    @NotBlank(message = "{validation.login.password.not_blank}")
    private String password;
}
