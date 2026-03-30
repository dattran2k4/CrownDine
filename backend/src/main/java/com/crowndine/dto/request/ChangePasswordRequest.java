package com.crowndine.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.Getter;

@Getter
public class ChangePasswordRequest {

    @NotBlank(message = "{validation.change_password.old_password.not_blank}")
    private String oldPassword;

    @NotBlank(message = "{validation.change_password.new_password.not_blank}")
    private String newPassword;

    @NotBlank(message = "{validation.change_password.confirm_new_password.not_blank}")
    private String confirmNewPassword;
}
