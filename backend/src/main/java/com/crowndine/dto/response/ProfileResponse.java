package com.crowndine.dto.response;

import com.crowndine.common.enums.EGender;
import lombok.Builder;
import lombok.Getter;

import java.time.LocalDate;

@Getter
@Builder
public class ProfileResponse {
    private String username;
    private String firstName;
    private String lastName;
    private String email;
    private String phone;
    private EGender gender;
    private LocalDate dateOfBirth;
}
