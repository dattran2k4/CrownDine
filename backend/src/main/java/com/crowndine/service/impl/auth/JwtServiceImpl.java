package com.crowndine.service.impl.auth;

import com.crowndine.common.enums.ETokenType;
import com.crowndine.common.enums.ErrorCode;
import com.crowndine.exception.InvalidDataException;
import com.crowndine.exception.JwtAuthenticationException;
import com.crowndine.service.auth.JwtService;
import io.jsonwebtoken.*;
import io.jsonwebtoken.security.Keys;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.apache.commons.lang3.StringUtils;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;

import java.security.Key;
import java.util.Date;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.function.Function;

@Service
@RequiredArgsConstructor
@Slf4j(topic = "JWT-SERVICE")
public class JwtServiceImpl implements JwtService {

    @Value("${jwt.access-key}")
    private String accessKey;

    @Value("${jwt.refresh-key}")
    private String refreshKey;

    @Value("${jwt.access-key-expiration}")
    private long accessExpiration;

    @Value("${jwt.refresh-key-expiration}")
    private long refreshExpiration;

    @Override
    public String extractUsername(String token, ETokenType type) {
        return extractClaim(token, type, Claims::getSubject);
    }

    private <T> T extractClaim(String token, ETokenType type, Function<Claims, T> claimsResolvers) {
        final Claims claims = extractAllClaims(token, type);
        return claimsResolvers.apply(claims);
    }

    private Claims extractAllClaims(String token, ETokenType tokenType) {

        if (StringUtils.isBlank(token)) {
            throw new JwtAuthenticationException(ErrorCode.TOKEN_MISSING);
        }
        try {
            return Jwts.parserBuilder()
                    .setSigningKey(getSigningKey(tokenType))
                    .build()
                    .parseClaimsJws(token)
                    .getBody();

        } catch (ExpiredJwtException e) {
            throw new JwtAuthenticationException(ErrorCode.TOKEN_EXPIRED, e);
        } catch (JwtException | IllegalArgumentException e) {
            throw new JwtAuthenticationException(ErrorCode.TOKEN_INVALID, e);
        }
    }

    private Key getSigningKey(ETokenType type) {
        switch (type) {
            case ACCESS_TOKEN -> {
                return Keys.hmacShaKeyFor(accessKey.getBytes());
            }
            case REFRESH_TOKEN -> {
                return Keys.hmacShaKeyFor(refreshKey.getBytes());
            }
            default -> throw new InvalidDataException("auth.token_type_not_found");
        }
    }

    @Override
    public String generateAccessToken(String username, List<String> authorities) {
        return buildToken(username, authorities, accessExpiration, ETokenType.ACCESS_TOKEN);
    }

    @Override
    public String generateRefreshToken(String username, List<String> authorities) {
        return buildToken(username, authorities, refreshExpiration, ETokenType.REFRESH_TOKEN);
    }

    private String buildToken(String username, List<String> authorities, long expiration, ETokenType type) {
        Map<String, Object> claims = new HashMap<>();
        claims.put("username", username);
        claims.put("role", authorities);
        return Jwts.builder()
                .setClaims(claims)
                .setSubject(username)
                .setIssuedAt(new Date(System.currentTimeMillis()))
                .setExpiration(new Date(System.currentTimeMillis() + expiration))
                .signWith(getSigningKey(type), SignatureAlgorithm.HS256)
                .compact();
    }

    @Override
    public boolean isTokenValid(String token, ETokenType type, UserDetails userDetails) {
        final String username = extractUsername(token, type);
        return (username.equals(userDetails.getUsername()) && !isTokenExpired(token, type));
    }

    private boolean isTokenExpired(String token, ETokenType type) {
        return extractExpiration(token, type).before(new Date());
    }

    private Date extractExpiration(String token, ETokenType type) {
        return extractClaim(token, type, Claims::getExpiration);
    }
}
