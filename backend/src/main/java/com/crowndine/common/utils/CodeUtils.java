package com.crowndine.common.utils;

import java.time.Instant;
import java.util.UUID;
import java.util.concurrent.ThreadLocalRandom;

public class CodeUtils {

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
        return "ORD-" + shortUUID();
    }

    public static String generateReservationCode() {
        return "RES-" + shortUUID();
    }

    private static String shortUUID() {
        return UUID.randomUUID()
                .toString()
                .replace("-", "")
                .substring(0, 8)
                .toUpperCase();
    }
}
