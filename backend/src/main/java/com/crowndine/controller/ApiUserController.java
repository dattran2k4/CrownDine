package com.crowndine.controller;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import com.crowndine.dto.request.ChangePasswordRequest;
import com.crowndine.dto.response.ApiResponse;
import com.crowndine.service.user.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.security.Principal;
import java.util.Map;

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

    @PutMapping("upload-avatar")
    public ApiResponse uploadAvatar(@RequestParam("image") MultipartFile file, Principal principal) throws IOException {
        Map params = ObjectUtils.asMap(
                "folder", "crown_dine_avatars",
                "resource_type", "image"
        );
        Map result = cloudinary.uploader().upload(file.getBytes(), params);
        return ApiResponse.builder()
                .status(200)
                .message("Update avatar successfully")
                .data(String.valueOf(result.get("secure_url")))
                .build();
    }
}
