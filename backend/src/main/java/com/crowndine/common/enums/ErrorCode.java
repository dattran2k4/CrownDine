package com.crowndine.common.enums;

import lombok.Getter;
import lombok.RequiredArgsConstructor;

@Getter
@RequiredArgsConstructor
public enum ErrorCode {
    TOKEN_EXPIRED("auth.token_expired"),
    TOKEN_INVALID("auth.token_invalid"),
    TOKEN_MISSING("auth.token_missing");

    private final String messageKey;
}
