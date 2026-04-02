package com.crowndine.service.auth;

import java.time.Duration;

public interface ResetPasswordTokenStateService {
    boolean isUsed(String tokenId);

    void markAsUsed(String tokenId, Duration ttl);
}
