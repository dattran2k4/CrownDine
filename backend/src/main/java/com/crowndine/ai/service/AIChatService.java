package com.crowndine.ai.service;

import com.crowndine.ai.intent.AIIntent;
import com.crowndine.ai.intent.AnalyzedIntent;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Flux;

import java.util.EnumMap;
import java.util.List;
import java.util.Map;

@Service
@Slf4j(topic = "AI-CHAT-SERVICE")
public class AIChatService {

    private final AIIntentClassifier aiIntentClassifier;
    private final Map<AIIntent, AIIntentHandler> intentHandlers;

    public AIChatService(AIIntentClassifier aiIntentClassifier, List<AIIntentHandler> handlers) {
        this.aiIntentClassifier = aiIntentClassifier;
        this.intentHandlers = new EnumMap<>(AIIntent.class);
        handlers.forEach(handler -> this.intentHandlers.put(handler.getSupportedIntent(), handler));
    }

    public Flux<String> chatStream(String username, String message) {
        AnalyzedIntent analyzedIntent = aiIntentClassifier.analyze(message);
        AIIntentHandler handler = intentHandlers.get(analyzedIntent.intent());

        if (handler == null) {
            log.info("No AI handler found for intent {}. Secondary intents={}",
                    analyzedIntent.intent(),
                    analyzedIntent.secondaryIntents());
            return Flux.just(buildUnsupportedIntentReply(analyzedIntent));
        }

        log.info("Routing AI chat to handler {} for intent {} with confidence {}",
                handler.getClass().getSimpleName(),
                analyzedIntent.intent(),
                analyzedIntent.confidence());
        return handler.chatStream(username, message, analyzedIntent);
    }

    private String buildUnsupportedIntentReply(AnalyzedIntent analyzedIntent) {
        if (AIIntent.OUT_OF_SCOPE.equals(analyzedIntent.intent())) {
            return "Cau hoi nay khong nam trong pham vi van hanh nha hang CrownDine ma toi dang ho tro.";
        }

        return "Intent " + analyzedIntent.intent().name() + " da duoc nhan dien, nhung hien chua co handler de xu ly.";
    }
}
