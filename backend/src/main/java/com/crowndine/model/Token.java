package com.crowndine.model;

import jakarta.persistence.*;
import jakarta.persistence.Table;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Table(name = "tokens")
public class Token extends AbstractEntity<Long> {

    @Column(name = "username")
    private String username;

    @Column(name = "refresh_token")
    private String refreshToken;

    @Column(name = "device")
    private String device;

    @Column(name = "ip_address")
    private String ipAddress;

    @Column(name = "is_revoked")
    private Boolean isRevoked;

    @Column(name = "expired_at")
    private LocalDateTime expiredAt;
}
