package com.crowndine.service.impl.auth;

import com.crowndine.common.enums.ERole;
import com.crowndine.common.enums.EUserStatus;
import com.crowndine.dto.request.ForgotPasswordRequest;
import com.crowndine.dto.request.LoginRequest;
import com.crowndine.dto.request.RegisterRequest;
import com.crowndine.dto.request.ResetPasswordRequest;
import com.crowndine.dto.response.TokenResponse;
import com.crowndine.exception.InvalidDataException;
import com.crowndine.exception.ResourceNotFoundException;
import com.crowndine.model.Role;
import com.crowndine.model.Token;
import com.crowndine.model.User;
import com.crowndine.repository.RoleRepository;
import com.crowndine.repository.TokenRepository;
import com.crowndine.repository.UserRepository;
import com.crowndine.common.enums.ETokenType;
import com.crowndine.service.auth.AuthenticationService;
import com.crowndine.service.auth.JwtService;
import com.crowndine.service.mail.MailService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.*;

@Service
@RequiredArgsConstructor
@Slf4j(topic = "AUTH-SERVICE")
public class AuthenticationServiceImpl implements AuthenticationService {

    @Value("${endpoint.confirmUser}")
    private String endPointConfirmUser;

    @Value("${endpoint.endPointResetPassword}")
    private String endPointResetPassword;

    private final UserRepository userRepository;
    private final JwtService jwtService;
    private final RoleRepository roleRepository;
    private final TokenRepository tokenRepository;
    private final MailService mailService;
    private final AuthenticationManager authenticationManager;
    private final PasswordEncoder passwordEncoder;

    @Override
    public TokenResponse login(LoginRequest request) {
        List<String> authorities = new ArrayList<>();

        try {
            Authentication authentication = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(request.getUsername(), request.getPassword()));

            authorities.add(authentication.getAuthorities().toString());

            SecurityContextHolder.getContext().setAuthentication(authentication);
        } catch (BadCredentialsException e) {
            log.error("errorMessage: {}", e.getMessage());
            throw new BadCredentialsException(e.getMessage());
        }

        String accessToken = jwtService.generateAccessToken(request.getUsername(), authorities);
        String refreshToken = jwtService.generateRefreshToken(request.getUsername(), authorities);

        // Save token to database
        User user = userRepository.findByUsername(request.getUsername())
                .orElseThrow(() -> new UsernameNotFoundException("User not found"));

        Token token = new Token();
        token.setToken(accessToken);
        token.setTokenType(ETokenType.ACCESS_TOKEN);
        token.setUser(user);
        token.setRevoked(false);
        token.setExpired(false);
        tokenRepository.save(token);

        return TokenResponse.builder()
                .accessToken(accessToken)
                .refreshToken(refreshToken)
                .build();
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public Long register(RegisterRequest request) {
        log.info("Processing register for user: {}", request.getUsername());

        if (!request.getPassword().equals(request.getConfirmPassword())) {
            throw new InvalidDataException("Mật khẩu xác nhận không khớp");
        }

        if (userRepository.existsByUsername(request.getUsername())) {
            throw new InvalidDataException("Tài khoản đã tồn tại");
        }

        if (userRepository.existsByEmail(request.getEmail())) {
            throw new InvalidDataException("Email đã tồn tại");
        }

        if (userRepository.existsByPhone(request.getPhone())) {
            throw new InvalidDataException("Số điện thoại đã tồn tại");
        }

        String randomCode = UUID.randomUUID().toString();

        // save to db
        User user = new User();
        user.setUsername(request.getUsername());
        user.setEmail(request.getEmail());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setGender(request.getGender());
        user.setDateOfBirth(request.getBirthday());
        user.setPhone(request.getPhone());
        user.setFirstName(request.getFirstName());
        user.setLastName(request.getLastName());
        user.setVerificationCode(randomCode);
        user.setVerificationExpiration(LocalDateTime.now().plusMinutes(5));
        user.setStatus(EUserStatus.INACTIVE);

        mailService.sendConfirmLink(request.getEmail(), "email-confirmation-register.html", endPointConfirmUser,
                randomCode);

        userRepository.save(user);

        log.info("User {} has been registered", user.getUsername());

        return user.getId();
    }

    @Override
    public String forgotPassword(ForgotPasswordRequest request) {
        log.info("Processing forgot password for user: {}", request.getEmail());
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new UsernameNotFoundException("Không tìm thấy tài khoản"));

        String randomCode = UUID.randomUUID().toString();
        user.setVerificationCode(randomCode);
        user.setVerificationExpiration(LocalDateTime.now().plusMinutes(5));

        mailService.sendConfirmLink(request.getEmail(), "email-confirmation-register.html", endPointConfirmUser,
                randomCode);

        userRepository.save(user);

        log.info("User {} has been sended email to reset password", user.getUsername());
        return null;
    }

    @Override
    public boolean confirmRegister(String verifyCode) {
        log.info("Processing verify code for register");

        User user = userRepository.findByVerificationCode(verifyCode)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy user qua mã xác nhận"));

        if (LocalDateTime.now().isAfter(user.getVerificationExpiration())) {
            log.error("Verification code expired for user {}", user.getUsername());
            return false;
        }

        user.setStatus(EUserStatus.ACTIVE);
        user.setVerificationCode(null);
        user.setVerificationExpiration(null);

        Role role = roleRepository.findByName(ERole.USER);
        user.setRoles(new HashSet<>(List.of(role)));

        userRepository.save(user);

        log.info("User {} has been verified", user.getUsername());
        return true;
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public void resetPassword(String verifyCode, ResetPasswordRequest request) {

        User user = userRepository.findByVerificationCode(verifyCode)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy tài khoản"));

        if (user.getVerificationExpiration().isAfter(LocalDateTime.now())) {
            log.error("Verification code expired for user {}", user.getUsername());
            return;
        }

        if (!request.getPassword().equals(request.getConfirmPassword())) {
            log.error("Passwords confirm do not match for user {}", user.getUsername());
            return;
        }

        user.setVerificationCode(null);
        user.setVerificationExpiration(null);
        user.setPassword(passwordEncoder.encode(request.getPassword()));

        userRepository.save(user);

        log.info("Reset password successfully");
    }

    @Override
    public void logout(String token) {
        log.info("Logout user with token");
        var storedToken = tokenRepository.findByToken(token).orElse(null);
        if (storedToken != null) {
            storedToken.setRevoked(true);
            storedToken.setExpired(true);
            tokenRepository.save(storedToken);
        }
    }

    @Override
    public TokenResponse refreshToken(String refreshToken) {
        log.info("Process refresh token");

        String username = jwtService.extractUsername(refreshToken, ETokenType.REFRESH_TOKEN);
        if (username == null) {
            throw new InvalidDataException("Refresh token không hợp lệ");
        }

        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new UsernameNotFoundException("Không tìm thấy người dùng"));

        if (!jwtService.isTokenValid(refreshToken, ETokenType.REFRESH_TOKEN, user)) {
            throw new InvalidDataException("Refresh token đã hết hạn hoặc không hợp lệ");
        }

        List<String> authorities = new ArrayList<>();
        authorities.add(user.getAuthorities().toString());

        String newAccessToken = jwtService.generateAccessToken(username, authorities);
        String newRefreshToken = jwtService.generateRefreshToken(username, authorities);

        Token token = new Token();
        token.setToken(newAccessToken);
        token.setTokenType(ETokenType.ACCESS_TOKEN);
        token.setUser(user);
        token.setRevoked(false);
        token.setExpired(false);
        tokenRepository.save(token);

        return TokenResponse.builder()
                .accessToken(newAccessToken)
                .refreshToken(newRefreshToken)
                .build();
    }
}
