package com.crowndine.presentation.dto.response;

import lombok.*;


@Builder
@Setter
@Getter
public class TokenResponse {
    private String accessToken;
    private String refreshToken;
    private String username;
}
