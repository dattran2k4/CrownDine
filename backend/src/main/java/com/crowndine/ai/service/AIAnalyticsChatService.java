package com.crowndine.ai.service;

import com.crowndine.ai.intent.AIIntent;
import com.crowndine.ai.intent.AnalyzedIntent;
import com.crowndine.ai.tool.AIToolNames;
import com.crowndine.ai.tool.method.AnalyticsMethodTools;
import com.crowndine.exception.AiRateLimitException;
import com.crowndine.exception.AiServiceException;
import com.google.genai.errors.ApiException;
import org.springframework.ai.chat.client.ChatClient;
import org.springframework.ai.chat.client.advisor.MessageChatMemoryAdvisor;
import org.springframework.ai.chat.client.advisor.SimpleLoggerAdvisor;
import org.springframework.ai.chat.memory.ChatMemory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.Resource;
import org.springframework.stereotype.Service;
import org.springframework.util.StreamUtils;
import reactor.core.publisher.Flux;

import java.io.IOException;
import java.nio.charset.StandardCharsets;

@Service
public class AIAnalyticsChatService implements AIIntentHandler {

    private final ChatClient chatClient;

    public AIAnalyticsChatService(ChatClient.Builder builder,
                                  ChatMemory chatMemory,
                                  AnalyticsMethodTools analyticsMethodTools,
                                  @Value("classpath:prompts/admin-analytics-chat-system.st") Resource systemPromptResource) {
        this.chatClient = builder
                .defaultSystem(loadSystemPrompt(systemPromptResource))
                .defaultAdvisors(
                        MessageChatMemoryAdvisor.builder(chatMemory).build(),
                        new SimpleLoggerAdvisor())
                .defaultToolNames(
                        AIToolNames.REVENUE_SUMMARY_TOOL,
                        AIToolNames.BEST_SELLING_ITEMS_TOOL,
                        AIToolNames.SLOW_SELLING_ITEMS_TOOL
                )
                .defaultTools(analyticsMethodTools)
                .build();
    }

    @Override
    public AIIntent getSupportedIntent() {
        return AIIntent.ANALYTICS_REPORTING;
    }

    @Override
    public Flux<String> chatStream(String username, String message, AnalyzedIntent analyzedIntent) {
        return this.chatClient.prompt()
                .system(system -> system.text("""
                        Ngu canh intent da phan tich:
                        - Intent chinh: %s
                        - Intent phu: %s
                        - Do tin cay: %.2f
                        - Ly do: %s
                        """.formatted(
                        analyzedIntent.intent(),
                        analyzedIntent.secondaryIntents(),
                        analyzedIntent.confidence(),
                        analyzedIntent.reason()
                )))
                .user(message)
                .advisors(advisorSpec -> advisorSpec.param(ChatMemory.CONVERSATION_ID, username))
                .stream()
                .content()
                .onErrorMap(this::mapAiException);
    }

    private String loadSystemPrompt(Resource resource) {
        try {
            return StreamUtils.copyToString(resource.getInputStream(), StandardCharsets.UTF_8);
        } catch (IOException e) {
            throw new IllegalStateException("Cannot load AI analytics system prompt", e);
        }
    }

    private Throwable mapAiException(Throwable throwable) {
        if (throwable instanceof AiRateLimitException || throwable instanceof AiServiceException) {
            return throwable;
        }

        ApiException apiException = findApiException(throwable);
        if (apiException == null) {
            return new AiServiceException("AI hien khong the phan hoi. Vui long thu lai sau.", throwable);
        }

        return switch (apiException.code()) {
            case 429 -> new AiRateLimitException("AI da het quota hoac dang bi gioi han tan suat. Vui long thu lai sau it phut.", throwable);
            case 400 -> new AiServiceException("Yeu cau gui toi AI khong hop le. Vui long thu lai sau.", throwable);
            case 401, 403 -> new AiServiceException("AI service dang gap loi xac thuc hoac quyen truy cap.", throwable);
            case 404 -> new AiServiceException("Khong tim thay model AI hoac tai nguyen AI duoc cau hinh.", throwable);
            case 408, 504 -> new AiServiceException("AI phan hoi qua lau. Vui long thu lai sau.", throwable);
            default -> new AiServiceException("AI hien tam thoi khong kha dung. Vui long thu lai sau.", throwable);
        };
    }

    private ApiException findApiException(Throwable throwable) {
        Throwable current = throwable;
        while (current != null) {
            if (current instanceof ApiException apiException) {
                return apiException;
            }
            current = current.getCause();
        }
        return null;
    }
}
