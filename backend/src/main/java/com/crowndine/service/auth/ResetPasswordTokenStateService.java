package com.crowndine.service.auth;

import java.time.Duration;

public interface ResetPasswordTokenStateService {
    void storeLatestTokenId(String username, String tokenId, Duration ttl);

    boolean isLatestToken(String username, String tokenId);

    void clearLatestToken(String username);
}
