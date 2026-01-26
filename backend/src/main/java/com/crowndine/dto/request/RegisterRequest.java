package com.crowndine.dto.request;

import com.crowndine.common.enums.EGender;
import com.crowndine.dto.validator.EnumValue;
import com.fasterxml.jackson.annotation.JsonFormat;
import jakarta.validation.constraints.*;
import lombok.Getter;
import org.springframework.format.annotation.DateTimeFormat;

import java.time.LocalDate;

@Getter
public class RegisterRequest {
    @NotBlank(message = "Tài khoản không được để trống")
    @Size(min = 5, max = 50, message = "Tài khoản phải từ 5 đến 50 ký tự")
    private String username;

    @NotBlank(message = "Mật khẩu không được để trống")
    @Size(min = 6, message = "Mật khẩu phải có ít nhất 6 ký tự")
    private String password;

    @NotBlank(message = "Mật khẩu xác nhận không được để trống")
    private String confirmPassword;

    @NotBlank(message = "Địa chỉ email không được để trống")
    @Email(message = "Email không đúng định dạng")
    private String email;

    @NotBlank(message = "Số điện thoại không được để trống")
    @Pattern(
            regexp = "^\\+?[0-9\\s\\-()]{7,20}$",
            message = "Định dạng số điện thoại không hợp lệ"
    )
    private String phone;

    @NotNull(message = "Ngày sinh không để trống!")
    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "dd/MM/yyyy")
    @Past(message = "Ngày sinh phải trước hôm nay")
    private LocalDate birthday;

    @NotNull(message = "Vui lòng chọn giới tính")
    @EnumValue(name = "gender", enumClass = EGender.class)
    private EGender gender;

    @NotBlank(message = "Tên không được để trống")
    private String firstName;

    @NotBlank(message = "Họ không được để trống")
    private String lastName;

}
