package com.crowndine.service.impl.auth;

import com.crowndine.service.auth.ResetPasswordTokenStateService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Service;

import java.time.Duration;

@Service
@RequiredArgsConstructor
public class ResetPasswordTokenStateServiceImpl implements ResetPasswordTokenStateService {
    private static final String RESET_PASSWORD_USED_PREFIX = "auth:reset-password:used:";
    private static final String USED_VALUE = "true";

    private final RedisTemplate<String, Object> redisTemplate;

    @Override
    public boolean isUsed(String tokenId) {
        return Boolean.TRUE.equals(redisTemplate.hasKey(buildUsedTokenKey(tokenId)));
    }

    @Override
    public void markAsUsed(String tokenId, Duration ttl) {
        Duration safeTtl = (ttl == null || ttl.isNegative() || ttl.isZero()) ? Duration.ofMinutes(10) : ttl;
        redisTemplate.opsForValue().set(buildUsedTokenKey(tokenId), USED_VALUE, safeTtl);
    }

    private String buildUsedTokenKey(String tokenId) {
        return RESET_PASSWORD_USED_PREFIX + tokenId;
    }
}
