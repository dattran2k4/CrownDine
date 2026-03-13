package com.crowndine.common.enums;

public enum EOrderStatus {
    PRE_ORDER,
    CONFIRMED,
    IN_PROGRESS,
    SERVED,
    COMPLETED,
    CANCELLED;

    public boolean isFinal() {
        return this == COMPLETED || this == CANCELLED;
    }
}
