package com.crowndine.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class AIChatRequest {

    @NotBlank(message = "chatId không được để trống")
    private String chatId;

    @NotBlank(message = "query không được để trống")
    private String query;
}
