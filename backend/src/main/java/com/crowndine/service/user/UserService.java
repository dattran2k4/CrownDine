package com.crowndine.service.user;

import com.crowndine.dto.request.ChangePasswordRequest;
import com.crowndine.dto.response.ProfileResponse;
import org.springframework.web.multipart.MultipartFile;

public interface UserService {
    void changePassword(ChangePasswordRequest request);

    String updateAvatar(MultipartFile file, String name);

    ProfileResponse getProfile(String name);
}
