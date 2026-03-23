package com.crowndine.util;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.UUID;

public class OrderCodeGenerator {
    private static final DateTimeFormatter FORMATTER = DateTimeFormatter.ofPattern("yyMMdd-HHmmss");

    public static String generateOrderCode() {
        String timestamp = LocalDateTime.now().format(FORMATTER);
        String randomStr = UUID.randomUUID().toString().substring(0, 4).toUpperCase();
        return String.format("ORD-%s-%s", timestamp, randomStr);
    }
}
