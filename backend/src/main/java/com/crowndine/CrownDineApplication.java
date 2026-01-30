package com.crowndine;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class CrownDineApplication {

    public static void main(String[] args) {
        SpringApplication.run(CrownDineApplication.class, args);
    }

}
