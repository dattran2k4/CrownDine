package com.crowndine.service.impl.user;

import com.crowndine.dto.request.ChangePasswordRequest;
import com.crowndine.repository.UserRepository;
import com.crowndine.service.user.UserService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
@Slf4j(topic = "USER-SERVICE")
public class UserServiceImpl implements UserService {

    private final UserRepository userRepository;

    @Override
    public void changePassword(ChangePasswordRequest request) {

    }
}
