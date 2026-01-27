package com.crowndine.service.impl.user;

import com.crowndine.dto.request.ChangePasswordRequest;
import com.crowndine.dto.request.UpdateProfileRequest;
import com.crowndine.dto.response.ApiResponse;
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
    @Transactional(rollbackFor = Exception.class)
    public void updateProfile(UpdateProfileRequest request, String name) {
        log.info("Processing for updating profile for user {}", name);

        User user = userRepository.findByUsername(name).orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy user"));

        user.setFirstName(request.getFirstName());
        user.setLastName(request.getLastName());
        user.setGender(request.getGender());
        user.setDateOfBirth(request.getDateOfBirth());
        userRepository.save(user);
        log.info("Successfully updated profile for user {}", name);
    }
}
