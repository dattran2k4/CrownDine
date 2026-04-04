package com.crowndine.common.utils;

import java.time.Instant;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.concurrent.ThreadLocalRandom;
import java.util.UUID;

public class CodeUtils {
    private static final DateTimeFormatter ENTITY_CODE_FORMATTER = DateTimeFormatter.ofPattern("yyMMdd-HHmmss");

    private CodeUtils() {
    }

    public static Long generatePaymentCode() {
        // 1. Lấy Epoch time theo giây (10 chữ số)
        // Ví dụ: 1706692540
        long timestamp = Instant.now().getEpochSecond();

        // 2. Lấy 4 số ngẫu nhiên (để tránh trùng nếu 2 request cùng 1 giây)
        // ThreadLocalRandom dùng tốt hơn Random thường trong môi trường đa luồng
        int randomBits = ThreadLocalRandom.current().nextInt(1000, 10000);

        // 3. Ghép lại
        // Kết quả sẽ là chuỗi số: 1706692540xxxx
        String orderCodeStr = String.valueOf(timestamp) + randomBits;

        return Long.parseLong(orderCodeStr);
    }

    public static String generateOrderCode() {
        return generateEntityCode("ORD");
    }

    public static String generateReservationCode() {
        return generateEntityCode("RES");
    }

    private static String generateEntityCode(String prefix) {
        String timestamp = LocalDateTime.now().format(ENTITY_CODE_FORMATTER);
        String randomSuffix = UUID.randomUUID().toString().substring(0, 4).toUpperCase();
        return String.format("%s-%s-%s", prefix, timestamp, randomSuffix);
    }
}
