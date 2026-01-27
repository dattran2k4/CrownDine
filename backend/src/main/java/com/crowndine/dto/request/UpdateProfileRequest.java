package com.crowndine.dto.request;

import com.crowndine.common.enums.EGender;
import com.crowndine.dto.validator.EnumValue;
import com.fasterxml.jackson.annotation.JsonFormat;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Past;
import lombok.Getter;

import java.time.LocalDate;

@Getter
public class UpdateProfileRequest {
    @NotBlank(message = "Tên không được để trống")
    private String firstName;

    @NotBlank(message = "Tên không được để trống")
    private String lastName;

    @NotNull(message = "Vui lòng chọn giới tính")
    @EnumValue(name = "gender", enumClass = EGender.class)
    private EGender gender;

    @NotNull(message = "Ngày sinh không để trống!")
    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "dd/MM/yyyy")
    @Past(message = "Ngày sinh phải trước hôm nay")
    private LocalDate dateOfBirth;
}
