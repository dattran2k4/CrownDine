package com.crowndine.dto.response;

import lombok.*;


@Builder
@Setter
@Getter
public class TokenResponse {
    private String accessToken;
    private String refreshToken;
}
