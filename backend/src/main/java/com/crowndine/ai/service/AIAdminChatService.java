package com.crowndine.ai.service;

import com.crowndine.ai.tool.AIToolNames;
import com.crowndine.ai.tool.method.AdminProductMethodTools;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.ai.chat.client.ChatClient;
import org.springframework.ai.chat.client.advisor.MessageChatMemoryAdvisor;
import org.springframework.ai.chat.client.advisor.SimpleLoggerAdvisor;
import org.springframework.ai.chat.memory.ChatMemory;
import org.springframework.core.io.Resource;
import org.springframework.stereotype.Service;
import org.springframework.util.StreamUtils;
import reactor.core.publisher.Flux;

import java.io.IOException;
import java.nio.charset.StandardCharsets;

@Service
public class AIAdminChatService {

    private final ChatClient chatClient;

    public AIAdminChatService(ChatClient.Builder builder,
                              ChatMemory chatMemory,
                              AdminProductMethodTools adminProductMethodTools,
                              @Value("classpath:prompts/admin-chatbot-system.st") Resource systemPromptResource) {

        this.chatClient = builder
                .defaultSystem(loadSystemPrompt(systemPromptResource))
                .defaultAdvisors(
                        MessageChatMemoryAdvisor.builder(chatMemory).build(),
                        new SimpleLoggerAdvisor())
                .defaultToolNames(AIToolNames.REVENUE_REPORT_TOOL)
                .defaultTools(adminProductMethodTools)
                .build();
    }

    public Flux<String> chatStream(String username, String message) {
        return this.chatClient.prompt()
                .user(message)
                .advisors(advisorSpec -> advisorSpec.param(ChatMemory.CONVERSATION_ID, username))
                .stream()
                .content();
    }

    private String loadSystemPrompt(Resource resource) {
        try {
            return StreamUtils.copyToString(resource.getInputStream(), StandardCharsets.UTF_8);
        } catch (IOException e) {
            throw new IllegalStateException("Cannot load AI system prompt", e);
        }
    }
}
