package com.crowndine.ai.service;

import com.crowndine.ai.intent.AIIntent;
import com.crowndine.ai.intent.AnalyzedIntent;
import com.crowndine.ai.tool.AIToolNames;
import com.crowndine.ai.tool.method.AnalyticsMethodTools;
import org.springframework.ai.chat.client.ChatClient;
import org.springframework.ai.chat.client.advisor.MessageChatMemoryAdvisor;
import org.springframework.ai.chat.client.advisor.SimpleLoggerAdvisor;
import org.springframework.ai.chat.memory.ChatMemory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.Resource;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Flux;

@Service
public class AIAnalyticsChatService implements AIIntentHandler {

    private final ChatClient chatClient;
    private final AIChatSupport aiChatSupport;

    public AIAnalyticsChatService(ChatClient.Builder builder,
                                  ChatMemory chatMemory,
                                  AIChatSupport aiChatSupport,
                                  AnalyticsMethodTools analyticsMethodTools,
                                  @Value("classpath:prompts/admin-analytics-chat-system.st") Resource systemPromptResource) {
        this.aiChatSupport = aiChatSupport;
        this.chatClient = builder
                .defaultSystem(aiChatSupport.loadPrompt(systemPromptResource, "Cannot load AI analytics system prompt"))
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
                .system(system -> system.text(aiChatSupport.buildIntentContext(analyzedIntent)))
                .user(message)
                .advisors(advisorSpec -> advisorSpec.param(ChatMemory.CONVERSATION_ID, username))
                .stream()
                .content()
                .onErrorMap(aiChatSupport::mapAiException);
    }
}
