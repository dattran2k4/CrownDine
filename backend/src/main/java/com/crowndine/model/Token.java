package com.crowndine.model;

import java.time.LocalDateTime;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Table(name = "tokens")
public class Token extends AbstractEntity<Long> {

    @Column(name = "username")
    private String username;
    @Column(columnDefinition = "TEXT")
    private String token;

    @Column(name = "refresh_token", length = 1000)
    private String refreshToken;

    @Column(name = "device", length = 1000)
    private String device;

    @Column(name = "ip_address")
    private String ipAddress;

    @Column(name = "is_revoked")
    private Boolean isRevoked;

    @Column(name = "expired_at")
    private LocalDateTime expiredAt;
}
