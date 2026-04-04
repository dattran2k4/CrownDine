package com.crowndine.dto.response;

import java.time.LocalDate;

import com.crowndine.common.enums.EGender;
import com.crowndine.common.enums.EUserStatus;

import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class ProfileResponse {
    private Long id;
    private String username;
    private String firstName;
    private String lastName;
    private String email;
    private String phone;
    private Integer rewardPoints;
    private String avatarUrl;
    private String role;
    private EGender gender;
    private LocalDate dateOfBirth;
    private EUserStatus status;
    private LocalDate createdAt;
    private LocalDate updatedAt;
}
