package com.crowndine.common.enums;

import lombok.Getter;
import lombok.RequiredArgsConstructor;

@Getter
@RequiredArgsConstructor
public enum EPaymentMethod {
    PAYOS("payos"),
    MOMO("momo"),
    CASH("cash"),
    ZALOPAY("zalopay");

    private final String value;
    
}
