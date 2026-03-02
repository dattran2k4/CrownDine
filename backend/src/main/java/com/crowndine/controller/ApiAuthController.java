package com.crowndine.controller;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.crowndine.dto.request.ForgotPasswordRequest;
import com.crowndine.dto.request.LoginRequest;
import com.crowndine.dto.request.RegisterRequest;
import com.crowndine.dto.request.ResetPasswordRequest;
import com.crowndine.dto.response.ApiResponse;
import com.crowndine.dto.response.TokenResponse;
import com.crowndine.service.auth.AuthenticationService;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@RestController
@Validated
@RequiredArgsConstructor
@RequestMapping("/api/auth")
@Slf4j(topic = "API-AUTH-CONTROLLER")
public class ApiAuthController {

    private final AuthenticationService authenticationService;

    @PostMapping("/login")
    public ResponseEntity<TokenResponse> login(@Valid @RequestBody LoginRequest request, HttpServletRequest httpServletRequest) {
        log.info("Login request for user: {}", request.getUsername());
        return new ResponseEntity<>(authenticationService.accessToken(request, httpServletRequest), HttpStatus.OK);
    }

    @PostMapping("/refresh-token")
    public ResponseEntity<TokenResponse> refreshToken(HttpServletRequest request) {
        log.info("Get new access token");
        return new ResponseEntity<>(authenticationService.refreshToken(request), HttpStatus.OK);
    }

    @PostMapping("/logout")
    public ApiResponse logout(HttpServletRequest request) {
        authenticationService.logout(request);
        return ApiResponse.builder()
                .status(200)
                .message("Successfully logged out")
                .build();
    }

    @PostMapping("/register")
    public ApiResponse register(@Valid @RequestBody RegisterRequest request) {
        log.info("Register request for user: {}", request.getUsername());

        Long userId = authenticationService.register(request);
        return ApiResponse.builder()
                .status(200)
                .message("Register successfully, check email verification")
                .data(userId)
                .build();
    }

    @PostMapping("verify-register")
    public ApiResponse verifyRegister(@RequestParam String verifyCode) {
        log.info("Verify register request for user, verify code: {}", verifyCode);

        boolean isSuccess = authenticationService.confirmRegister(verifyCode);

        return ApiResponse.builder()
                .status(isSuccess ? 200 : 404)
                .message(isSuccess ? "Verify successfully" : "Verify register failed")
                .build();
    }

    // Nhap email
    @PostMapping("forgot-password")
    public ApiResponse forgotPassword(@Valid @RequestBody ForgotPasswordRequest request) {
        log.info("Forgot password request for email: {}", request.getEmail());
        return null;
    }

    // Verify code + doi mat khau moi
    public ApiResponse resetPassword(@Valid @RequestBody ResetPasswordRequest request,
            @RequestParam String verifyCode) {
        log.info("Reset Password request for user, verify code: {}", verifyCode);
        return null;
    }
}
