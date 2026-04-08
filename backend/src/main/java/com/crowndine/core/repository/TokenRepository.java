package com.crowndine.core.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.crowndine.core.entity.Token;

@Repository
public interface TokenRepository extends JpaRepository<Token, Long> {
    Optional<Token> findByUsername(String username);

    Optional<Token> findByRefreshToken(String refreshToken);
}
