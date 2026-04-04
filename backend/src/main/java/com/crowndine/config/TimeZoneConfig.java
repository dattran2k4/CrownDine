package com.crowndine.config;

import jakarta.annotation.PostConstruct;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;

import java.time.ZoneId;
import java.util.TimeZone;

@Configuration
@Slf4j(topic = "TIMEZONE-CONFIG")
public class TimeZoneConfig {

    @Value("${app.timezone:Asia/Ho_Chi_Minh}")
    private String appTimezone;

    @PostConstruct
    public void init() {
        ZoneId zoneId = ZoneId.of(appTimezone);
        TimeZone.setDefault(TimeZone.getTimeZone(zoneId));
        log.info("Application timezone is set to {}", appTimezone);
    }
}
