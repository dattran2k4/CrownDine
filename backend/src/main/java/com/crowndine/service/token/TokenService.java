package com.crowndine.service.token;

import com.crowndine.model.Token;
import jakarta.servlet.http.HttpServletRequest;

public interface TokenService {

    void saveToken(String username, String refreshToken, HttpServletRequest request);

    Token getByUsername(String username);

    Token getByRefreshToken(String refreshToken);

    void revokedByRefreshToken(String refreshToken);
}
