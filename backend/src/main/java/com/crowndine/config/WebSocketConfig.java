package com.crowndine.config;

import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.messaging.simp.config.MessageBrokerRegistry;
import org.springframework.web.socket.config.annotation.EnableWebSocketMessageBroker;
import org.springframework.web.socket.config.annotation.StompEndpointRegistry;
import org.springframework.web.socket.config.annotation.WebSocketMessageBrokerConfigurer;

@Configuration
@EnableWebSocketMessageBroker
@RequiredArgsConstructor
public class WebSocketConfig implements WebSocketMessageBrokerConfigurer {

    private final WebSocketHandshakeInterceptor webSocketHandshakeInterceptor;
    private final AuthenticatedPrincipalHandshakeHandler authenticatedPrincipalHandshakeHandler;
    @Value("${app.websocket.allowed-origin-patterns:http://localhost:5173}")
    private String[] allowedOriginPatterns;

    @Override
    public void registerStompEndpoints(StompEndpointRegistry registry) {
        registry.addEndpoint("/ws-restaurant")
                .addInterceptors(webSocketHandshakeInterceptor)
                .setHandshakeHandler(authenticatedPrincipalHandshakeHandler)
                .setAllowedOriginPatterns(allowedOriginPatterns);
//                .withSockJS();
    }

    @Override
    public void configureMessageBroker(MessageBrokerRegistry config) {
        config.setApplicationDestinationPrefixes("/app");
        config.setUserDestinationPrefix("/user");
        config.enableSimpleBroker("/topic", "/queue");
    }
}
