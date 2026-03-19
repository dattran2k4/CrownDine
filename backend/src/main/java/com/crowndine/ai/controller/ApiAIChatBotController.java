package com.crowndine.ai.controller;

import com.crowndine.ai.dto.request.AIChatRequest;
import com.crowndine.ai.service.AIAdminChatService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.MediaType;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import reactor.core.publisher.Flux;

import java.security.Principal;

@RestController
@Validated
@RequiredArgsConstructor
@RequestMapping("/api/ai")
@Slf4j(topic = "API-AI-CHAT-BOT-CONTROLLER")
public class ApiAIChatBotController {

    private final AIAdminChatService aiAdminChatService;

    @PostMapping(value = "/chat", produces = MediaType.APPLICATION_JSON_VALUE)
    public Flux<String> chat(@Valid @RequestBody AIChatRequest request, Principal principal) {
        return aiAdminChatService.chatStream(principal.getName(), request.getMessage());
    }
}
