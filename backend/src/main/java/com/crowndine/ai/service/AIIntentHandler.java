package com.crowndine.ai.service;

import com.crowndine.ai.intent.AIIntent;
import com.crowndine.ai.intent.AnalyzedIntent;
import reactor.core.publisher.Flux;

public interface AIIntentHandler {

    AIIntent getSupportedIntent();

    Flux<String> chatStream(String username, String message, AnalyzedIntent analyzedIntent);
}
