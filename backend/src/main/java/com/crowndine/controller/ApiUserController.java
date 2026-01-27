package com.crowndine.controller;

import com.cloudinary.Cloudinary;
import com.crowndine.dto.request.ChangePasswordRequest;
import com.crowndine.dto.request.UpdateProfileRequest;
import com.crowndine.dto.response.ApiResponse;
import com.crowndine.dto.response.ProfileResponse;
import com.crowndine.service.user.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.security.Principal;

@RestController
@Validated
@RequiredArgsConstructor
@RequestMapping("/api/users")
@Slf4j(topic = "API-USER-CONTROLLER")
public class ApiUserController {

    private final UserService userService;
    private final Cloudinary cloudinary;

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

    @PatchMapping("upload-avatar")
    public ApiResponse uploadAvatar(@RequestParam("image") MultipartFile file, Principal principal) {
        String avatarUrl = userService.updateAvatar(file, principal.getName());
        return ApiResponse.builder()
                .status(200)
                .message("Update avatar successfully")
                .data(avatarUrl)
                .build();
    }

    @GetMapping("/profile")
    public ApiResponse getProfile(Principal principal) {
        ProfileResponse response = userService.getProfile(principal.getName());
        return ApiResponse.builder()
                .status(200)
                .message("Get profile successfully")
                .data(response)
    @PutMapping
    public ApiResponse updateProfile(@RequestBody UpdateProfileRequest request, Principal principal) {
        log.info("Request update profile for user {}", principal.getName());
        userService.updateProfile(request, principal.getName());
        return ApiResponse.builder()
                .status(200)
                .message("Update avatar successfully")
                .build();
    }
}
