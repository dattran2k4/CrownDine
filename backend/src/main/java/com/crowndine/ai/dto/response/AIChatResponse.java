package com.crowndine.ai.dto.response;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class AIChatResponse {
    private final String chatId;
    private final String content;
}
