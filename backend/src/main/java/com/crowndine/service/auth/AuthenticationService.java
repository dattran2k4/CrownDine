package com.crowndine.service.auth;

import com.crowndine.dto.request.ForgotPasswordRequest;
import com.crowndine.dto.request.LoginRequest;
import com.crowndine.dto.request.RegisterRequest;
import com.crowndine.dto.request.ResetPasswordRequest;
import com.crowndine.dto.response.TokenResponse;
import jakarta.servlet.http.HttpServletRequest;

public interface AuthenticationService {
    TokenResponse accessToken(LoginRequest request, HttpServletRequest httpServletRequest);

    TokenResponse refreshToken(HttpServletRequest request);

    void logout(HttpServletRequest request);

    Long register(RegisterRequest request);

    String forgotPassword(ForgotPasswordRequest request);

    boolean confirmRegister(String verifyCode);

    void resetPassword(String verifyCode, ResetPasswordRequest request);

    void logout(String token);

    TokenResponse refreshToken(String refreshToken);
}
