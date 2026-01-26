package com.crowndine.service.user;

import com.crowndine.dto.request.ChangePasswordRequest;

public interface UserService {
    void changePassword(ChangePasswordRequest request);
}
