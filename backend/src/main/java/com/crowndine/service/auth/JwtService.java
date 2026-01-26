package com.crowndine.service.auth;

import com.crowndine.common.enums.ETokenType;
import org.springframework.security.core.userdetails.UserDetails;

public interface JwtService {
    String extractUsername(String token, ETokenType type);

    String generateAccessToken(UserDetails user);

    String generateRefreshToken(UserDetails user);

    boolean isTokenValid(String token, ETokenType type, UserDetails userDetails);
}
