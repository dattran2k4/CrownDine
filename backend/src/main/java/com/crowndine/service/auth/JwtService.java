package com.crowndine.service.auth;

import com.crowndine.common.enums.ETokenType;
import org.springframework.security.core.userdetails.UserDetails;

import java.time.Duration;
import java.util.List;

public interface JwtService {
    String extractUsername(String token, ETokenType type);

    String extractTokenId(String token, ETokenType type);

    Duration getRemainingValidity(String token, ETokenType type);

    String generateAccessToken(String username, List<String> authorities);

    String generateRefreshToken(String username, List<String> authorities);

    String generateResetPasswordToken(String username);

    boolean isTokenValid(String token, ETokenType type, UserDetails userDetails);
}
