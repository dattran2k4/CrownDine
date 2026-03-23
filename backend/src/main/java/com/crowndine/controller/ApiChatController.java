package com.crowndine.controller;

import com.crowndine.dto.request.ChatConversationRequest;
import com.crowndine.dto.request.ChatMessageRequest;
import com.crowndine.dto.response.ApiResponse;
import com.crowndine.dto.response.ChatConversationResponse;
import com.crowndine.dto.response.ChatMessageResponse;
import com.crowndine.service.chat.ChatService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/chat")
@Slf4j(topic = "API-CHAT-CONTROLLER")
public class ApiChatController {

    private final ChatService chatService;

    @PostMapping("/conversations")
    public ApiResponse createConversation(
            @Valid @RequestBody ChatConversationRequest request,
            Principal principal) {
        return ApiResponse.builder()
                .status(201)
                .message("Tạo cuộc trò chuyện thành công")
                .data(chatService.createConversation(principal.getName(), request))
                .build();
    }

    @GetMapping("/conversations")
    public ApiResponse listConversations(Principal principal) {
        return ApiResponse.builder()
                .status(200)
                .message("Lấy danh sách cuộc trò chuyện thành công")
                .data(chatService.listConversations(principal.getName()))
                .build();
    }

    @GetMapping("/conversations/{conversationId}")
    public ApiResponse getConversation(
            @PathVariable Long conversationId,
            Principal principal) {
        return ApiResponse.builder()
                .status(200)
                .message("Lấy cuộc trò chuyện thành công")
                .data(chatService.getConversation(conversationId, principal.getName()))
                .build();
    }

    @PostMapping("/messages")
    public ApiResponse sendMessage(
            @Valid @RequestBody ChatMessageRequest request,
            Principal principal) {
        return ApiResponse.builder()
                .status(201)
                .message("Gửi tin nhắn thành công")
                .data(chatService.sendMessage(principal.getName(), request))
                .build();
    }

    @DeleteMapping("/conversations/{conversationId}")
    public ApiResponse deleteConversation(
            @PathVariable Long conversationId,
            Principal principal) {
        chatService.deleteConversation(conversationId, principal.getName());
        return ApiResponse.builder()
                .status(200)
                .message("Xóa cuộc trò chuyện thành công")
                .build();
    }
}
