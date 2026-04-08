package com.crowndine.core.service.impl.token;

import com.crowndine.presentation.exception.InvalidDataException;
import com.crowndine.presentation.exception.ResourceNotFoundException;
import com.crowndine.core.entity.Token;
import com.crowndine.core.repository.TokenRepository;
import com.crowndine.core.service.token.TokenService;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
@Slf4j(topic = "TOKEN-SERVICE")
public class TokenServiceImpl implements TokenService {

    private final TokenRepository tokenRepository;

    @Value("${jwt.refresh-key-expiration}")
    private long refreshExpiration;

    @Override
    public void saveToken(String username, String refreshToken, HttpServletRequest request) {
        Token token = new Token();
        token.setUsername(username);
        token.setDevice(request.getHeader("User-Agent"));
        token.setIpAddress(request.getRemoteAddr());
        token.setRefreshToken(refreshToken);
        token.setExpiredAt(LocalDateTime.now().plusNanos(refreshExpiration * 1_000_00));
        token.setIsRevoked(false);
        tokenRepository.save(token);
        log.info("Token saved with id {}", token.getId());
    }

    @Override
    public Token getByUsername(String username) {
        return tokenRepository.findByUsername(username).orElseThrow(() -> new ResourceNotFoundException("Token not found"));
    }

    @Override
    public Token getByRefreshToken(String refreshToken) {
        return tokenRepository.findByRefreshToken(refreshToken).orElseThrow(() -> new ResourceNotFoundException("Token not found"));
    }

    @Override
    public void revokedByRefreshToken(String refreshToken) {
        Token token = getByRefreshToken(refreshToken);

        if (token.getExpiredAt().isBefore(LocalDateTime.now())) {
            throw new InvalidDataException("Refresh token expired");
        }

        if (Boolean.FALSE.equals(token.getIsRevoked())) {
            token.setIsRevoked(true);
        } else {
            throw new InvalidDataException("Token is revoked");
        }
        tokenRepository.save(token);
        log.info("Token revoked with id {}", token.getId());
    }

}
