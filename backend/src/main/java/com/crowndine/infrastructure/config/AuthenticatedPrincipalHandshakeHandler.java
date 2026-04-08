package com.crowndine.infrastructure.config;

import org.jetbrains.annotations.NotNull;
import org.springframework.http.server.ServerHttpRequest;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.WebSocketHandler;
import org.springframework.web.socket.server.support.DefaultHandshakeHandler;

import java.security.Principal;
import java.util.Map;

@Component
public class AuthenticatedPrincipalHandshakeHandler extends DefaultHandshakeHandler {

    @Override
    protected Principal determineUser(@NotNull ServerHttpRequest request, @NotNull WebSocketHandler wsHandler, Map<String, Object> attributes) {
        Object authenticatedUser = attributes.get("authenticatedUser");
        if (authenticatedUser instanceof Authentication authentication) {
            return authentication;
        }

        return super.determineUser(request, wsHandler, attributes);
    }
}
