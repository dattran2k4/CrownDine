package com.crowndine.ai.service;

import com.crowndine.ai.intent.AIIntent;
import com.crowndine.ai.intent.AnalyzedIntent;
import org.springframework.ai.chat.client.ChatClient;
import org.springframework.ai.chat.client.advisor.MessageChatMemoryAdvisor;
import org.springframework.ai.chat.client.advisor.SimpleLoggerAdvisor;
import org.springframework.ai.chat.memory.ChatMemory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.Resource;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Flux;

@Service
public class AISystemGuideChatService implements AIIntentHandler {

    private final ChatClient chatClient;
    private final AdminSystemGuideKnowledgeProvider knowledgeProvider;
    private final AIChatSupport aiChatSupport;

    public AISystemGuideChatService(ChatClient.Builder builder,
                                    ChatMemory chatMemory,
                                    AIChatSupport aiChatSupport,
                                    AdminSystemGuideKnowledgeProvider knowledgeProvider,
                                    @Value("classpath:prompts/admin-system-guide-chat-system.st") Resource systemPromptResource) {
        this.aiChatSupport = aiChatSupport;
        this.knowledgeProvider = knowledgeProvider;
        this.chatClient = builder
                .defaultSystem(aiChatSupport.loadPrompt(systemPromptResource, "Cannot load AI system guide prompt"))
                .defaultAdvisors(
                        MessageChatMemoryAdvisor.builder(chatMemory).build(),
                        new SimpleLoggerAdvisor())
                .build();
    }

    @Override
    public AIIntent getSupportedIntent() {
        return AIIntent.SYSTEM_GUIDANCE;
    }

    @Override
    public Flux<String> chatStream(String username, String message, AnalyzedIntent analyzedIntent) {
        return this.chatClient.prompt()
                .system(system -> system.text("""
                        %s
                        
                        Kien thuc huong dan he thong cho Admin:
                        %s
                        """.formatted(
                        aiChatSupport.buildIntentContext(analyzedIntent),
                        knowledgeProvider.buildKnowledge()
                )))
                .user(message)
                .advisors(advisorSpec -> advisorSpec.param(ChatMemory.CONVERSATION_ID, username))
                .stream()
                .content()
                .onErrorMap(aiChatSupport::mapAiException);
    }
}
