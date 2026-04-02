package com.crowndine.service.impl.auth;

import com.crowndine.service.auth.ResetPasswordTokenStateService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

import java.time.Duration;
import java.util.Objects;

@Service
@RequiredArgsConstructor
public class ResetPasswordTokenStateServiceImpl implements ResetPasswordTokenStateService {
    private static final String RESET_PASSWORD_LATEST_PREFIX = "auth:reset-password:latest:";

    private final RedisTemplate<String, Object> redisTemplate;

    @Override
    public void storeLatestTokenId(String username, String tokenId, Duration ttl) {
        Duration safeTtl = (ttl == null || ttl.isNegative() || ttl.isZero()) ? Duration.ofMinutes(10) : ttl;
        redisTemplate.opsForValue().set(buildLatestTokenKey(username), tokenId, safeTtl);
    }

    @Override
    public boolean isLatestToken(String username, String tokenId) {
        Object storedTokenId = redisTemplate.opsForValue().get(buildLatestTokenKey(username));
        return StringUtils.hasText(tokenId) && Objects.equals(tokenId, storedTokenId);
    }

    @Override
    public void clearLatestToken(String username) {
        redisTemplate.delete(buildLatestTokenKey(username));
    }

    private String buildLatestTokenKey(String username) {
        return RESET_PASSWORD_LATEST_PREFIX + username;
    }
}
