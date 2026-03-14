package com.crowndine.controller;

import com.crowndine.service.AIAdminChatService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.MediaType;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import reactor.core.publisher.Flux;

@RestController
@Validated
@RequiredArgsConstructor
@RequestMapping("/api/ai")
@Slf4j(topic = "API-AI-CHAT-BOT-CONTROLLER")
public class ApiAIChatBotController {

    private final AIAdminChatService aiAdminChatService;

    @GetMapping(value = "/chat", produces = MediaType.APPLICATION_JSON_VALUE)
    public Flux<String> chat(@RequestParam String chatId, @RequestParam String query) {
        return aiAdminChatService.chatStream(chatId, query);
    }
}
