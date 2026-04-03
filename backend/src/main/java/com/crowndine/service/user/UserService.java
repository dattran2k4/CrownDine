package com.crowndine.service.user;

import com.crowndine.dto.request.ChangePasswordRequest;
import com.crowndine.dto.response.ProfileResponse;
import com.crowndine.dto.request.UpdateProfileRequest;
import com.crowndine.model.User;
import org.springframework.web.multipart.MultipartFile;

public interface UserService {
    void changePassword(ChangePasswordRequest request, String username);

    String updateAvatar(MultipartFile file, String name);

    ProfileResponse getProfile(String name);

    ProfileResponse getProfileByPhone(String phone);

    void updateProfile(UpdateProfileRequest request, String name);

    User getUserById(Long id);

    User getUserByUserName(String username);

    java.util.List<ProfileResponse> getAllCustomers();
    
    void sendEmailOtp(String username, String newEmail);

    void verifyEmailOtp(String username, String otp, String newEmail);
}
