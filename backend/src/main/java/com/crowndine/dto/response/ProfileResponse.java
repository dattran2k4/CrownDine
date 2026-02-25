package com.crowndine.dto.response;

import com.crowndine.common.enums.EGender;
import lombok.Builder;
import lombok.Getter;

import java.time.LocalDate;

@Getter
@Builder
public class ProfileResponse {
    private Long id;
    private String username;
    private String firstName;
    private String lastName;
    private String email;
    private String phone;
    private String avatarUrl;
    private String role;
    private EGender gender;
    private LocalDate dateOfBirth;
    private LocalDate createdAt;
    private LocalDate updatedAt;
}
