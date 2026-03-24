package com.crowndine.ai.intent;

import java.util.List;

public record AnalyzedIntent(AIIntent intent, List<AIIntent> secondaryIntents, String reason, double confidence) {
}
