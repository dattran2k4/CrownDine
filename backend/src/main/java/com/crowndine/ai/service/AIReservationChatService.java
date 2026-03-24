package com.crowndine.ai.service;

import com.crowndine.ai.intent.AIIntent;
import com.crowndine.ai.intent.AnalyzedIntent;
import com.crowndine.ai.tool.AIToolNames;
import com.crowndine.ai.tool.method.ReservationMethodTools;
import org.springframework.ai.chat.client.ChatClient;
import org.springframework.ai.chat.client.advisor.MessageChatMemoryAdvisor;
import org.springframework.ai.chat.client.advisor.SimpleLoggerAdvisor;
import org.springframework.ai.chat.memory.ChatMemory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.Resource;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Flux;

@Service
public class AIReservationChatService implements AIIntentHandler {

    private final ChatClient chatClient;
    private final AIChatSupport aiChatSupport;

    public AIReservationChatService(ChatClient.Builder builder,
                                    ChatMemory chatMemory,
                                    AIChatSupport aiChatSupport,
                                    ReservationMethodTools reservationMethodTools,
                                    @Value("classpath:prompts/admin-reservation-chat-system.st") Resource systemPromptResource) {
        this.aiChatSupport = aiChatSupport;
        this.chatClient = builder
                .defaultSystem(aiChatSupport.loadPrompt(systemPromptResource, "Cannot load AI reservation system prompt"))
                .defaultAdvisors(
                        MessageChatMemoryAdvisor.builder(chatMemory).build(),
                        new SimpleLoggerAdvisor())
                .defaultToolNames(AIToolNames.RESERVATION_LIST_TOOL)
                .defaultTools(reservationMethodTools)
                .build();
    }

    @Override
    public AIIntent getSupportedIntent() {
        return AIIntent.RESERVATION_MANAGEMENT;
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

    public String getReservationHandlerInfo() {
        return "Reservation handler dang xu ly cac cau hoi ve dat ban, tinh trang reservation va thao tac quan ly dat ban.";
    }
}
