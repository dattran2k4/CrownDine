package com.crowndine.controller;

import com.crowndine.dto.request.ChangePasswordRequest;
import com.crowndine.dto.response.ApiResponse;
import com.crowndine.service.user.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

@RestController
@Validated
@RequiredArgsConstructor
@RequestMapping("/api/users")
@Slf4j(topic = "API-USER-CONTROLLER")
public class ApiUserController {

    private final UserService userService;

    @GetMapping
    public ApiResponse getListUsers() {
        return ApiResponse.builder()
                .status(200)
                .message("Get list users")
                .data("This is data")
                .build();
    }

    @PostMapping("change-password")
    public ApiResponse changePassword(@Valid @RequestBody ChangePasswordRequest changePasswordRequest) {
        return ApiResponse.builder().build();
    }
}
