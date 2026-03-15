package com.crowndine.ai.service;

import com.crowndine.ai.tool.AIToolNames;
import com.crowndine.ai.tool.method.AdminTableMethodTools;
import org.springframework.ai.chat.client.ChatClient;
import org.springframework.ai.chat.client.advisor.PromptChatMemoryAdvisor;
import org.springframework.ai.chat.client.advisor.SimpleLoggerAdvisor;
import org.springframework.ai.chat.memory.ChatMemory;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Flux;

@Service
public class AIAdminChatService {

    private final ChatClient chatClient;

    public AIAdminChatService(ChatClient.Builder builder,
                              ChatMemory chatMemory,
                              AdminTableMethodTools adminTableMethodTools) {

        this.chatClient = builder
                .defaultSystem("""
                        Bạn là trợ lý ảo Admin cho nhà hàng 'Vinh Quang'.
                        Nhiệm vụ của bạn là hỗ trợ quản lý tra cứu dữ liệu.
                        Hãy luôn sử dụng các công cụ (tools) có sẵn để lấy số liệu thực tế trước khi trả lời.
                        Trả lời ngắn gọn, chuyên n ghiệp bằng tiếng Việt.
                        """)
                .defaultAdvisors(
                        PromptChatMemoryAdvisor.builder(chatMemory).build(),
                        new SimpleLoggerAdvisor())
                .defaultToolNames(AIToolNames.REVENUE_REPORT_TOOL)
                .defaultTools(adminTableMethodTools)
                .build();
    }

    public Flux<String> chatStream(String chatId, String message) {
        return this.chatClient.prompt()
                .user(message)
                .stream()
                .content();
    }
}
