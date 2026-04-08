package com.crowndine.presentation.dto.response;

import com.crowndine.common.enums.EGender;
import com.crowndine.common.enums.EUserStatus;
import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

@Builder
@Setter
@Getter
public class UserResponse {
    private Long id;
    private String username;
    private Integer rewardPoints;
    private String phone;
    private String email;
    private EGender gender;
    private EUserStatus status;
    private String firstName;
    private String lastName;
}
