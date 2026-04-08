package com.crowndine.presentation.controller;

import com.cloudinary.Cloudinary;
import com.crowndine.presentation.dto.request.ChangePasswordRequest;
import com.crowndine.presentation.dto.request.SendEmailOtpRequest;
import com.crowndine.presentation.dto.request.UpdateProfileRequest;
import com.crowndine.presentation.dto.request.VerifyEmailOtpRequest;
import com.crowndine.presentation.dto.response.ApiResponse;
import com.crowndine.presentation.dto.response.ProfileResponse;
import com.crowndine.core.service.user.RewardPointService;
import com.crowndine.core.service.user.UserService;
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
    private final RewardPointService rewardPointService;
    private final Cloudinary cloudinary;

    @GetMapping
    public ApiResponse getListUsers() {
        return ApiResponse.builder()
                .status(200)
                .message("Get list customers successfully")
                .data(userService.getAllCustomers())
                .build();
    }

    @PostMapping("change-password")
    public ApiResponse changePassword(@Valid @RequestBody ChangePasswordRequest changePasswordRequest, Principal principal) {
        userService.changePassword(changePasswordRequest, principal.getName());
        return ApiResponse.builder()
                .status(200)
                .message("Change password successfully")
                .build();
    }

    @PostMapping("profile/email-otp/send")
    public ApiResponse sendEmailOtp(@Valid @RequestBody SendEmailOtpRequest request, Principal principal) {
        userService.sendEmailOtp(principal.getName(), request.getNewEmail());
        return ApiResponse.builder()
                .status(200)
                .message("OTP sent to your current email")
                .build();
    }

    @PostMapping("profile/email-otp/verify")
    public ApiResponse verifyEmailOtp(@Valid @RequestBody VerifyEmailOtpRequest request, Principal principal) {
        userService.verifyEmailOtp(principal.getName(), request.getOtp(), request.getNewEmail());
        return ApiResponse.builder()
                .status(200)
                .message("Email updated successfully")
                .build();
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
        log.info(response.toString());
        return ApiResponse.builder()
                .status(200)
                .message("Get profile successfully")
                .data(response)
                .build();
    }

    @GetMapping("/profile/point-history")
    public ApiResponse getPointHistory(
            Principal principal,
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "5") int size) {
        return ApiResponse.builder()
                .status(200)
                .message("Get point history successfully")
                .data(rewardPointService.getMyPointHistory(principal.getName(), page, size))
                .build();
    }

    @GetMapping("/customer/{phone}")
    @org.springframework.security.access.prepost.PreAuthorize("hasAnyAuthority('ADMIN', 'STAFF')")
    public ApiResponse getCustomerByPhone(@org.springframework.web.bind.annotation.PathVariable String phone) {
        ProfileResponse response = userService.getProfileByPhone(phone);
        return ApiResponse.builder()
                .status(200)
                .message("Get customer profile by phone successfully")
                .data(response)
                .build();
    }

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
