package com.crowndine.ai.service;

import com.crowndine.ai.intent.AIIntent;
import com.crowndine.ai.intent.AnalyzedIntent;
import lombok.extern.slf4j.Slf4j;
import org.springframework.ai.chat.client.ChatClient;
import org.springframework.ai.converter.BeanOutputConverter;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.Resource;
import org.springframework.stereotype.Service;
import org.springframework.util.StreamUtils;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.util.List;

@Service
@Slf4j(topic = "AI-INTENT-CLASSIFIER")
public class AIIntentClassifier {

    private final ChatClient chatClient;
    private final String classifierPrompt;
    private final BeanOutputConverter<AnalyzedIntent> outputConverter;

    public AIIntentClassifier(ChatClient.Builder builder,
                              @Value("classpath:prompts/admin-intent-classifier-system.st") Resource classifierPromptResource) {
        this.chatClient = builder.build();
        this.classifierPrompt = loadPrompt(classifierPromptResource);
        this.outputConverter = new BeanOutputConverter<>(AnalyzedIntent.class);
    }

    public AnalyzedIntent analyze(String message) {
        AnalyzedIntent analyzedIntent = chatClient.prompt()
                .system(system -> system
                        .text(classifierPrompt)
                        .param("availableIntents", AIIntent.toPromptText())
                        .param("format", outputConverter.getFormat()))
                .user(message)
                .call()
                .entity(outputConverter);

        return normalize(analyzedIntent);
    }

    private AnalyzedIntent normalize(AnalyzedIntent analyzedIntent) {
        if (analyzedIntent == null) {
            return fallback();
        }

        AIIntent intent = analyzedIntent.intent() != null ? analyzedIntent.intent() : AIIntent.OUT_OF_SCOPE;
        List<AIIntent> secondaryIntents = analyzedIntent.secondaryIntents() != null ? analyzedIntent.secondaryIntents() : List.of();
        String reason = analyzedIntent.reason() != null ? analyzedIntent.reason() : "Khong co giai thich cu the.";
        double confidence = Math.max(0.0d, Math.min(1.0d, analyzedIntent.confidence()));

        return new AnalyzedIntent(intent, secondaryIntents, reason, confidence);
    }

    private AnalyzedIntent fallback() {
        log.warn("AI intent classifier returned null result");
        return new AnalyzedIntent(
                AIIntent.OUT_OF_SCOPE,
                List.of(),
                "Khong phan tich duoc intent tu noi dung hien tai.",
                0.0d
        );
    }

    private String loadPrompt(Resource resource) {
        try {
            return StreamUtils.copyToString(resource.getInputStream(), StandardCharsets.UTF_8);
        } catch (IOException e) {
            throw new IllegalStateException("Cannot load AI intent classifier prompt", e);
        }
    }
}
