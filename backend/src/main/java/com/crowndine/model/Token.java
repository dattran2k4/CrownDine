package com.crowndine.model;

import com.crowndine.common.enums.ETokenType;
import jakarta.persistence.*;
import jakarta.persistence.Table;
import lombok.*;

@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Table(name = "tokens")
public class Token extends AbstractEntity<Long> {

    @Column(unique = true, nullable = false)
    private String token;

    @Enumerated(EnumType.STRING)
    @Column(name = "token_type")
    private ETokenType tokenType;

    @Column(name = "is_revoked")
    public boolean revoked; // Token đã bị hủy (User logout)

    @Column(name = "is_expired")
    public boolean expired; // Token đã hết hạn

    @ManyToOne
    @JoinColumn(name = "user_id")
    private User user;
}
