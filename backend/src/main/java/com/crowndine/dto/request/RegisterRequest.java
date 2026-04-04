package com.crowndine.dto.request;

import java.time.LocalDate;

import com.crowndine.common.enums.EGender;
import com.crowndine.dto.validator.EnumValue;
import com.fasterxml.jackson.annotation.JsonFormat;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Past;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.Getter;

@Getter
public class RegisterRequest {
    @NotBlank(message = "{validation.register.username.not_blank}")
    @Size(min = 5, max = 50, message = "{validation.register.username.size}")
    private String username;

    @NotBlank(message = "{validation.register.password.not_blank}")
    @Size(min = 6, message = "{validation.register.password.size}")
    private String password;

    @NotBlank(message = "{validation.register.confirm_password.not_blank}")
    private String confirmPassword;

    @NotBlank(message = "{validation.register.email.not_blank}")
    @Email(message = "{validation.register.email.invalid}")
    private String email;

    @NotBlank(message = "{validation.register.phone.not_blank}")
    @Pattern(
            regexp = "^\\+?[0-9\\s\\-()]{7,20}$",
            message = "{validation.register.phone.invalid}"
    )
    private String phone;

    // @NotNull(message = "Ngày sinh không để trống!")
    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "dd/MM/yyyy")
    @Past(message = "{validation.register.birthday.past}")
    private LocalDate birthday;

    // @NotNull(message = "Vui lòng chọn giới tính")
    @EnumValue(name = "gender", enumClass = EGender.class)
    private EGender gender;

    @NotBlank(message = "{validation.register.first_name.not_blank}")
    private String firstName;

    @NotBlank(message = "{validation.register.last_name.not_blank}")
    private String lastName;

}
