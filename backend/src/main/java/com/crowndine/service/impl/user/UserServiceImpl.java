package com.crowndine.service.impl.user;

import com.crowndine.dto.request.ChangePasswordRequest;
import com.crowndine.dto.response.ApiResponse;
import com.crowndine.dto.response.ProfileResponse;
import com.crowndine.exception.ResourceNotFoundException;
import com.crowndine.model.User;
import com.crowndine.repository.UserRepository;
import com.crowndine.service.cloudinary.CloudinaryService;
import com.crowndine.service.user.UserService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

@Service
@RequiredArgsConstructor
@Slf4j(topic = "USER-SERVICE")
public class UserServiceImpl implements UserService {

    private final UserRepository userRepository;
    private final CloudinaryService cloudinaryService;

    @Override
    public void changePassword(ChangePasswordRequest request) {

    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public String updateAvatar(MultipartFile file, String name) {
        log.info("Processing for updating avatar for user {}", name);

        User user = userRepository.findByUsername(name).orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy user"));

        String avatarUrl = cloudinaryService.uploadAvatar(file, user.getAvatarUrl());

        user.setAvatarUrl(avatarUrl);

        userRepository.save(user);
        log.info("Successfully updated avatar for user {}", name);

        return avatarUrl;
    }

    @Override
    public ProfileResponse getProfile(String name) {
        log.info("Processing for getting profile for user {}", name);

        User user = userRepository.findByUsername(name).orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy user"));

        ProfileResponse response = ProfileResponse.builder()
                .gender(user.getGender())
                .username(user.getUsername())
                .firstName(user.getFirstName())
                .lastName(user.getLastName())
                .email(user.getEmail())
                .phone(user.getPhone())
                .dateOfBirth(user.getDateOfBirth())
                .build();

        log.info("Successfully retrieved profile for user {}", name);
        return response;
    }
}
