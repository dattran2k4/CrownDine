package com.crowndine.service.auth;

import com.crowndine.dto.request.ForgotPasswordRequest;
import com.crowndine.dto.request.LoginRequest;
import com.crowndine.dto.request.RegisterRequest;
import com.crowndine.dto.request.ResetPasswordRequest;
import com.crowndine.dto.response.TokenResponse;

public interface AuthenticationService {
    TokenResponse login(LoginRequest request);

    Long register(RegisterRequest request);

    String forgotPassword(ForgotPasswordRequest request);

    boolean confirmRegister(String verifyCode);

    void resetPassword(String verifyCode, ResetPasswordRequest request);

}
