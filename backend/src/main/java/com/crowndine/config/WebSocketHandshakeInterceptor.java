package com.crowndine.config;

import com.crowndine.common.enums.ETokenType;
import com.crowndine.security.CustomUserDetailsService;
import com.crowndine.service.auth.JwtService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.apache.commons.lang3.StringUtils;
import org.jetbrains.annotations.NotNull;
import org.springframework.http.server.ServerHttpRequest;
import org.springframework.http.server.ServerHttpResponse;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.WebSocketHandler;
import org.springframework.web.socket.server.HandshakeInterceptor;

import java.net.URI;
import java.net.URLDecoder;
import java.nio.charset.StandardCharsets;
import java.util.Map;

@Component
@RequiredArgsConstructor
@Slf4j(topic = "WEBSOCKET-HANDSHAKE-INTERCEPTOR")
public class WebSocketHandshakeInterceptor implements HandshakeInterceptor {

    private final JwtService jwtService;
    private final CustomUserDetailsService userDetailsService;

    @Override
    public boolean beforeHandshake(ServerHttpRequest request, @NotNull ServerHttpResponse response, @NotNull WebSocketHandler wsHandler,
                                   @NotNull Map<String, Object> attributes) {
        String token = extractAccessToken(request.getURI());
        if (StringUtils.isBlank(token)) {
            log.warn("WebSocket handshake missing access_token query param");
            return true;
        }

        String username = jwtService.extractUsername(token, ETokenType.ACCESS_TOKEN);
        UserDetails userDetails = userDetailsService.loadUserByUsername(username);

        if (!jwtService.isTokenValid(token, ETokenType.ACCESS_TOKEN, userDetails)) {
            log.warn("WebSocket handshake token invalid for user {}", username);
            return true;
        }

        UsernamePasswordAuthenticationToken authentication = new UsernamePasswordAuthenticationToken(
                userDetails,
                null,
                userDetails.getAuthorities()
        );
        attributes.put("authenticatedUser", authentication);
        log.info("WebSocket handshake authenticated for user {}", username);
        return true;
    }

    @Override
    public void afterHandshake(@NotNull ServerHttpRequest request, @NotNull ServerHttpResponse response, @NotNull WebSocketHandler wsHandler,
                               Exception exception) {
        // TODO document why this method is empty
    }

    private String extractAccessToken(URI uri) {
        String query = uri.getQuery();
        if (StringUtils.isBlank(query)) {
            return null;
        }

        String[] params = query.split("&");
        for (String param : params) {
            String[] keyValue = param.split("=", 2);
            if (keyValue.length != 2 || !"access_token".equals(keyValue[0])) {
                continue;
            }

            return URLDecoder.decode(keyValue[1], StandardCharsets.UTF_8);
        }
        return null;
    }
}
