package com.crowndine.dto.request;

import com.crowndine.common.enums.EVoucherType;
import com.crowndine.dto.validator.EnumValue;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Getter;

import java.math.BigDecimal;

@Getter
public class VoucherRequest {
    @NotBlank(message = "Tên voucher không được để trống")
    @Size(max = 100, message = "Tên voucher tối đa 100 ký tự")
    private String name;

    @NotBlank(message = "Mã voucher không được để trống")
    @Size(max = 100, message = "Mã voucher tối đa 100 ký tự")
    private String code;

    @NotNull(message = "Loại voucher không được để trống")
    @EnumValue(name = "type", enumClass = EVoucherType.class)
    private EVoucherType type;

    @NotNull(message = "Giá trị giảm không được để trống")
    @DecimalMin(value = "0.01", message = "Giá trị giảm phải lớn hơn 0")
    private BigDecimal discountValue;

    @DecimalMin(value = "0.0", inclusive = false, message = "Giảm tối đa phải lớn hơn 0")
    private BigDecimal maxDiscountValue;

    private String description;
}
