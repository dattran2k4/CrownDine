package com.crowndine.controller;

import com.crowndine.dto.request.ForgotPasswordRequest;
import com.crowndine.dto.request.LoginRequest;
import com.crowndine.dto.request.RegisterRequest;
import com.crowndine.dto.request.ResetPasswordRequest;
import com.crowndine.dto.response.ApiResponse;
import com.crowndine.dto.response.TokenResponse;
import com.crowndine.service.auth.AuthenticationService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import java.util.Collection;

@RestController
@Validated
@RequiredArgsConstructor
@RequestMapping("/api/auth")
@Slf4j(topic = "API-AUTH-CONTROLLER")
public class ApiAuthController {

    private final AuthenticationService authenticationService;

    @PostMapping("/login")
    public ResponseEntity<TokenResponse> login(@Valid @RequestBody LoginRequest request) {
        log.info("Login request for user: {}", request.getUsername());
        return new ResponseEntity<>(authenticationService.login(request), HttpStatus.OK);
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
    public ResponseEntity<?> verifyRegister(@RequestParam String verifyCode) {
        log.info("Verify register request for user, verify code: {}", verifyCode);

        boolean isSuccess = authenticationService.confirmRegister(verifyCode);
        if (isSuccess) {
            return ResponseEntity.ok("Kích hoạt tài khoản thành công! Bạn có thể đăng nhập.");
        }
        return ResponseEntity.badRequest().body("Mã xác nhận không hợp lệ hoặc đã được sử dụng.");
    }

    //Nhap email
    @PostMapping("forgot-password")
    public ApiResponse forgotPassword(@Valid @RequestBody ForgotPasswordRequest request) {
        log.info("Forgot password request for email: {}", request.getEmail());
        return null;
    }

    //Verify code + doi mat khau moi
    public ApiResponse resetPassword(@Valid @RequestBody ResetPasswordRequest request, @RequestParam String verifyCode) {
        log.info("Reset Password request for user, verify code: {}", verifyCode);
        return null;
    }
}
