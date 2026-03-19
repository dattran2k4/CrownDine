package com.crowndine.common.tools;

import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;

public class PasswordHashGenerator {

    private static final String RAW_PASSWORD = "123456";
    private static final int HASH_COUNT = 20;

    public static void main(String[] args) {
        PasswordEncoder passwordEncoder = new BCryptPasswordEncoder();

        System.out.println("Raw password: " + RAW_PASSWORD);
        System.out.println("Generated hashes:");

        for (int i = 1; i <= HASH_COUNT; i++) {
            System.out.println(i + ". " + passwordEncoder.encode(RAW_PASSWORD));
        }
    }
}
