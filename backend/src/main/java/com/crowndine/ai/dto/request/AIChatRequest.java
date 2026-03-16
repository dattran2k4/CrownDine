package com.crowndine.ai.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class AIChatRequest {

    @NotBlank(message = "message không được để trống")
    private String message;
}
