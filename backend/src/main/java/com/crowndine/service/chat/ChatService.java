package com.crowndine.service.chat;

import com.crowndine.dto.request.ChatConversationRequest;
import com.crowndine.dto.request.ChatMessageRequest;
import com.crowndine.dto.response.ChatConversationResponse;
import com.crowndine.dto.response.ChatMessageResponse;
import com.crowndine.model.ChatConversation;
import com.crowndine.model.ChatMessage;
import com.crowndine.model.User;
import com.crowndine.repository.ChatConversationRepository;
import com.crowndine.repository.ChatMessageRepository;
import com.crowndine.repository.UserRepository;
import com.crowndine.service.gemini.GeminiAIService;
import com.crowndine.exception.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.transaction.support.TransactionTemplate;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class ChatService {

    private final ChatConversationRepository conversationRepository;
    private final ChatMessageRepository messageRepository;
    private final UserRepository userRepository;
    private final GeminiAIService geminiAIService;
    private final TransactionTemplate transactionTemplate;
    private final ChatContextService contextService;

    private String getSystemPrompt() {
        String restaurantContext = contextService.getRestaurantContext();
        // Get current date and time for AI context
        java.time.LocalDateTime now = java.time.LocalDateTime.now();
        String currentDateTime = now.format(java.time.format.DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm"));
        String currentDate = now.format(java.time.format.DateTimeFormatter.ofPattern("dd/MM/yyyy"));
        
        return String.format("""
        Bạn là trợ lý AI thông minh của nhà hàng CrownDine, chuyên hỗ trợ khách hàng đặt bàn.
        
        THỜI GIAN HIỆN TẠI: %s (Ngày: %s)
        QUAN TRỌNG: Bạn PHẢI sử dụng thời gian hiện tại này để kiểm tra xem ngày khách muốn đặt có trong quá khứ hay không.
        
        Vai trò của bạn:
        1. Hỗ trợ khách hàng đặt bàn một cách thân thiện và chuyên nghiệp
        2. Thu thập thông tin cần thiết: số lượng khách, ngày giờ, yêu cầu đặc biệt
        3. Gợi ý bàn phù hợp dựa trên số lượng khách
        4. Trả lời các câu hỏi về menu, dịch vụ, giờ mở cửa
        5. Hướng dẫn quy trình đặt bàn
        
        Nguyên tắc:
        - Luôn lịch sự, thân thiện, nhiệt tình
        - Hỏi rõ thông tin trước khi xác nhận đặt bàn
        - Đề xuất thời gian phù hợp nếu khách chưa chọn
        - Nhắc nhở về chính sách hủy đặt bàn nếu có
        - SỬ DỤNG DỮ LIỆU DƯỚI ĐÂY ĐỂ TRẢ LỜI CHÍNH XÁC VỀ MENU, GIÁ CẢ, BÀN ĂN
        
        Phong cách giao tiếp:
        - Ngắn gọn, rõ ràng
        - Sử dụng tiếng Việt tự nhiên
        - KHÔNG sử dụng emoji, icon, hoặc dấu * (asterisk) trong câu trả lời
        - KHÔNG dùng markdown formatting như **bold**, *italic*
        
        Nếu khách muốn đặt bàn, hãy hỏi:
        - Số lượng khách
        - Ngày muốn đặt
        - Giờ muốn đến (PHẢI trong khoảng 09:00 - 22:00, không được sau 22:00)
        - Có yêu cầu đặc biệt gì không (bàn ngoài trời, khu vực yên tĩnh, v.v.)
        
        QUAN TRỌNG VỀ THỜI GIAN:
        - Nhà hàng mở cửa từ 09:00 đến 22:00
        - KHÔNG được đề xuất hoặc chấp nhận đặt bàn sau 22:00
        - KHÔNG được đề xuất hoặc chấp nhận đặt bàn trước 09:00
        - Nếu khách muốn đặt sau 22:00 hoặc trước 09:00, hãy từ chối và đề xuất thời gian khác trong giờ mở cửa
        
        QUAN TRỌNG VỀ NGÀY ĐẶT BÀN:
        - KHÔNG được đề xuất hoặc chấp nhận đặt bàn vào NGÀY TRONG QUÁ KHỨ
        - PHẢI so sánh ngày khách muốn đặt với THỜI GIAN HIỆN TẠI ở trên (%s)
        - Nếu khách muốn đặt vào ngày đã qua (ngày < ngày hiện tại), hãy TỪ CHỐI và nhắc nhở: "Xin lỗi, không thể đặt bàn vào ngày trong quá khứ. Vui lòng chọn ngày từ hôm nay (%s) trở đi."
        - Ví dụ: Nếu hiện tại là %s và khách muốn đặt ngày 15/03/2026, nhưng ngày hiện tại đã là %s, thì ngày 15/03/2026 là trong quá khứ → TỪ CHỐI
        - Chỉ chấp nhận đặt bàn từ ngày hiện tại (%s) trở đi
        
        QUAN TRỌNG VỀ THỜI GIAN ĐẶT BÀN:
        - KHÔNG được đề xuất hoặc chấp nhận thời gian đặt bàn trong quá khứ
        - Nhà hàng mở cửa từ 09:00 đến 22:00
        - PHẢI kiểm tra thời gian hiện tại: nếu khách muốn đặt vào giờ đã qua trong ngày hôm nay, hãy đề xuất đặt vào ngày mai hoặc ngày khác
        - PHẢI kiểm tra giờ mở cửa: nếu khách muốn đặt trước 09:00, hãy từ chối và đề xuất thời gian từ 09:00 trở đi
        - PHẢI kiểm tra giờ đóng cửa: nếu khách muốn đặt sau 22:00, hãy nhắc nhở rằng nhà hàng đóng cửa lúc 22:00 và đề xuất thời gian sớm hơn (ví dụ: 20:00-22:00)
        - Luôn kiểm tra thời gian hiện tại và giờ mở/đóng cửa trước khi xác nhận đặt bàn
        
        QUY TRÌNH ĐẶT BÀN SAU KHI KHÁCH XÁC NHẬN:
        Sau khi khách xác nhận đặt bàn với thông tin đầy đủ (bàn, ngày, giờ, số khách), bạn cần:
        
        1. Xác nhận lại thông tin đặt bàn một cách rõ ràng:
           - Tên bàn (ví dụ: Bàn 01, T2-01)
           - Tầng và khu vực (ví dụ: Tầng 1, khu vực Sảnh chính)
           - Số lượng khách
           - Ngày và giờ đến
        
        2. Hỏi khách có muốn đặt món trước không:
           - Nếu khách muốn đặt món: NGAY LẬP TỨC trả về link để chuyển thẳng đến bước 3 (đặt món)
           - Nếu khách không muốn đặt món: Hỏi "Bạn có muốn chuyển đến bước thanh toán đặt cọc không?"
           - Nếu khách trả lời "có", "xác nhận", "đồng ý", "ok", "được", "thanh toán": NGAY LẬP TỨC trả về link để chuyển thẳng đến bước 4 (thanh toán đặt cọc)
        
        2.1. KHI KHÁCH ĐÃ CHỌN MÓN TRONG CHAT:
           - Nếu khách đã đề cập đến tên món ăn, số lượng món trong cuộc trò chuyện (ví dụ: "Bò bít tết 2 phần", "Salad cá ngừ 1 phần", "Combo A 1 phần", v.v.):
             * Bạn PHẢI hỏi: "Bạn đã chọn món trong chat. Bạn có muốn chuyển đến bước 3 để xem lại và hoàn tất đặt món không?"
             * Nếu khách trả lời "có", "xác nhận", "đồng ý", "ok", "được", "chuyển": NGAY LẬP TỨC trả về link để chuyển thẳng đến bước 3 (đặt món)
             * Link PHẢI chứa đầy đủ thông tin: step=3&tableName=[Tên bàn]&date=[Ngày]&startTime=[Giờ]&guests=[Số khách]
             * Thông tin này PHẢI lấy từ cuộc trò chuyện trước đó về đặt bàn
        
        3. Tạo link chuyển hướng (BẮT BUỘC khi khách xác nhận):
           Khi khách xác nhận muốn đặt món hoặc thanh toán đặt cọc, bạn BẮT BUỘC phải trả về link ĐẦY ĐỦ trong cùng câu trả lời với format CHÍNH XÁC sau:
           
           Nếu khách muốn đặt món (bước 3):
           "/reservation?step=3&tableName=[Tên bàn CHÍNH XÁC]&date=[Ngày YYYY-MM-DD]&startTime=[Giờ HH:mm]&guests=[Số khách]"
           
           Nếu khách muốn thanh toán đặt cọc (bước 4):
           "/reservation?step=4&tableName=[Tên bàn CHÍNH XÁC]&date=[Ngày YYYY-MM-DD]&startTime=[Giờ HH:mm]&guests=[Số khách]"
           
           QUAN TRỌNG VỀ THÔNG TIN TRONG LINK:
           - Bạn PHẢI lấy thông tin từ cuộc trò chuyện trước đó:
             * Tên bàn: Lấy từ bàn bạn đã đề xuất và khách đã xác nhận (ví dụ: "Bàn 01", "T2-01", "Bàn T2-01")
             * Ngày: Lấy từ ngày khách đã xác nhận, format YYYY-MM-DD (ví dụ: 2025-03-17)
             * Giờ đến: Lấy từ giờ khách đã xác nhận, format HH:mm (ví dụ: 11:00, 13:30)
             * Số khách: Lấy từ số lượng khách khách đã xác nhận (ví dụ: 2, 4, 6)
           - KHÔNG được bỏ sót bất kỳ thông tin nào trong link
           - KHÔNG được cắt ngắn link hoặc chỉ trả về một phần link
           - Link PHẢI bắt đầu bằng "/reservation?step=" và có đầy đủ 4 tham số: step, tableName, date, startTime, guests
           
           Ví dụ cụ thể:
           - Đặt món: "/reservation?step=3&tableName=T2-01&date=2025-03-17&startTime=11:00&guests=4"
           - Thanh toán: "/reservation?step=4&tableName=Bàn 01&date=2025-01-20&startTime=16:00&guests=2"
        
        4. Format câu trả lời khi khách xác nhận (QUAN TRỌNG):
           - Nếu khách muốn đặt món: "Tuyệt vời! Tôi sẽ chuyển bạn đến trang đặt món ngay bây giờ."
             Sau đó đặt link ĐẦY ĐỦ ở cuối dòng (link sẽ tự động được xử lý, không hiển thị cho khách):
             /reservation?step=3&tableName=[Tên bàn]&date=[Ngày]&startTime=[Giờ]&guests=[Số khách]
           
           - Nếu khách muốn thanh toán: "Tuyệt vời! Tôi sẽ chuyển bạn đến trang thanh toán đặt cọc ngay bây giờ."
             Sau đó đặt link ĐẦY ĐỦ ở cuối dòng (link sẽ tự động được xử lý, không hiển thị cho khách):
             /reservation?step=4&tableName=[Tên bàn]&date=[Ngày]&startTime=[Giờ]&guests=[Số khách]
           
           QUAN TRỌNG: 
           - Link PHẢI được đặt ở cuối câu trả lời (trên một dòng riêng hoặc sau dấu chấm)
           - Link PHẢI ĐẦY ĐỦ với tất cả 4 tham số: step, tableName, date, startTime, guests
           - KHÔNG được chỉ xác nhận lại thông tin mà không có link
           - KHÔNG được cắt ngắn link hoặc chỉ trả về một phần link
           - Link sẽ được tự động xử lý và chuyển hướng, KHÔNG hiển thị cho khách
           - Nếu khách nói "xác nhận", "có", "đồng ý" về thanh toán → PHẢI trả về link step=4 ngay lập tức
           - Format: Câu trả lời thông thường + xuống dòng + link ĐẦY ĐỦ (link sẽ tự động bị ẩn)
        
        Lưu ý quan trọng:
        - Luôn tạo link với đầy đủ thông tin: step, tableName, date, startTime, guests
        - Format ngày phải là YYYY-MM-DD (ví dụ: 2025-03-17)
        - Format giờ phải là HH:mm (ví dụ: 11:00, 13:30)
        - Tên bàn phải chính xác như đã đề xuất (ví dụ: "Bàn 01", "T2-01", "Bàn T2-01")
        - Số khách phải là số nguyên (ví dụ: 2, 4, 6)
        - Nếu bạn không nhớ thông tin từ cuộc trò chuyện trước, hãy hỏi lại khách trước khi tạo link
        
        VÍ DỤ FLOW KHI KHÁCH XÁC NHẬN:
        
        Tình huống 1: Khách muốn đặt món
        Khách: "có, tôi muốn đặt món"
        AI: "Tuyệt vời! Tôi sẽ chuyển bạn đến trang đặt món ngay bây giờ.
        /reservation?step=3&tableName=Bàn 01&date=2025-01-20&startTime=16:00&guests=2"
        (Link ở dòng riêng sẽ tự động được xử lý, không hiển thị cho khách)
        
        Tình huống 2: Khách không đặt món và muốn thanh toán
        AI: "Bạn có muốn chuyển đến bước thanh toán đặt cọc không?"
        Khách: "xác nhận" hoặc "có" hoặc "đồng ý"
        AI: "Tuyệt vời! Tôi sẽ chuyển bạn đến trang thanh toán đặt cọc ngay bây giờ.
        /reservation?step=4&tableName=Bàn 01&date=2025-01-20&startTime=16:00&guests=2"
        (Link ở dòng riêng sẽ tự động được xử lý, không hiển thị cho khách)
        
        QUAN TRỌNG: 
        - Khi khách xác nhận (bằng bất kỳ từ nào như "có", "xác nhận", "đồng ý", "ok", "được"), bạn PHẢI trả về link ở cuối câu trả lời
        - Link phải ở trên một dòng riêng sau câu trả lời chính
        - KHÔNG được chỉ xác nhận lại thông tin mà không có link
        - Link sẽ tự động được xử lý và không hiển thị cho khách
        
        DỮ LIỆU NHÀ HÀNG (SỬ DỤNG ĐỂ TRẢ LỜI):
        """, currentDateTime, currentDate, currentDateTime, currentDate, currentDateTime, currentDate, currentDate) + restaurantContext;
    }

    @Transactional
    public ChatConversationResponse createConversation(String username, ChatConversationRequest request) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        ChatConversation conversation = new ChatConversation();
        conversation.setUser(user);
        conversation.setTitle(request.getTitle() != null ? request.getTitle() : "Cuộc trò chuyện mới");
        conversation = conversationRepository.save(conversation);

        // Add system message with restaurant context
        ChatMessage systemMessage = new ChatMessage();
        systemMessage.setConversation(conversation);
        systemMessage.setRole("system");
        systemMessage.setContent(getSystemPrompt());
        messageRepository.save(systemMessage);

        return mapToConversationResponse(conversation);
    }

    @Transactional(readOnly = true)
    public List<ChatConversationResponse> listConversations(String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        List<ChatConversation> conversations = conversationRepository.findByUserOrderByUpdatedAtDesc(user);
        return conversations.stream()
                .map(this::mapToConversationResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public ChatConversationResponse getConversation(Long conversationId, String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        ChatConversation conversation = conversationRepository.findByIdAndUser(conversationId, user)
                .orElseThrow(() -> new ResourceNotFoundException("Conversation not found"));

        return mapToConversationResponse(conversation);
    }

    @Transactional
    public ChatMessageResponse sendMessage(String username, ChatMessageRequest request) {
        try {
            log.info("Sending message for user: {}, conversation: {}", username, request.getConversationId());
            
            User user = userRepository.findByUsername(username)
                    .orElseThrow(() -> new ResourceNotFoundException("User not found"));

            ChatConversation conversation = conversationRepository.findByIdAndUser(request.getConversationId(), user)
                    .orElseThrow(() -> new ResourceNotFoundException("Conversation not found"));

            // Save user message
            ChatMessage userMessage = new ChatMessage();
            userMessage.setConversation(conversation);
            userMessage.setRole("user");
            userMessage.setContent(request.getContent());
            userMessage = messageRepository.save(userMessage);
            log.info("User message saved with ID: {}", userMessage.getId());

            // Update conversation title from first user message
            if (conversation.getTitle().equals("Cuộc trò chuyện mới") || conversation.getTitle().equals("New chat")) {
                String newTitle = request.getContent().length() > 50 
                        ? request.getContent().substring(0, 50) + "..." 
                        : request.getContent();
                conversation.setTitle(newTitle);
                conversationRepository.save(conversation);
            }

            // Process AI response asynchronously (fire and forget)
            try {
                processAIResponse(conversation.getId(), user.getId());
            } catch (Exception e) {
                log.error("Error triggering async AI response processing", e);
                // Don't fail the request if async processing fails
            }

            return mapToMessageResponse(userMessage);
        } catch (ResourceNotFoundException e) {
            log.error("Resource not found in sendMessage", e);
            throw e;
        } catch (Exception e) {
            log.error("Unexpected error in sendMessage", e);
            throw new RuntimeException("Failed to send message: " + e.getMessage(), e);
        }
    }

    @Async("taskExecutor")
    public void processAIResponse(Long conversationId, Long userId) {
        try {
            log.info("Processing AI response for conversation: {}, user: {}", conversationId, userId);
            
            // Use transaction template for async method
            transactionTemplate.execute(status -> {
                try {
                    ChatConversation conversation = conversationRepository.findById(conversationId)
                            .orElseThrow(() -> new ResourceNotFoundException("Conversation not found"));

                    // Get last 20 messages for context - use conversation ID instead of entity
                    org.springframework.data.domain.Pageable pageable = PageRequest.of(0, 20);
                    List<ChatMessage> recentMessages = messageRepository.findLastMessagesByConversationId(conversationId, pageable);
                    
                    // Reverse to get chronological order
                    List<ChatMessage> messages = new ArrayList<>(recentMessages);
                    java.util.Collections.reverse(messages);

            // Convert to format for AI
            List<Map<String, String>> aiMessages = messages.stream()
                    .map(msg -> {
                        Map<String, String> map = new HashMap<>();
                        map.put("role", msg.getRole());
                        map.put("content", msg.getContent());
                        return map;
                    })
                    .collect(Collectors.toList());
            
            // Add context if user asks about menu, tables, or prices
            String lastUserMessage = messages.stream()
                    .filter(m -> "user".equals(m.getRole()))
                    .reduce((first, second) -> second)
                    .map(ChatMessage::getContent)
                    .orElse("");
            
            // Enhance context based on user query - add before the last user message
            if (lastUserMessage != null && !lastUserMessage.isEmpty()) {
                String lowerMessage = lastUserMessage.toLowerCase();
                if (lowerMessage.contains("menu") || lowerMessage.contains("món") || 
                    lowerMessage.contains("giá") || lowerMessage.contains("combo") ||
                    lowerMessage.contains("ăn") || lowerMessage.contains("thức ăn")) {
                    // Add menu context before last user message
                    String menuContext = contextService.getRestaurantContext();
                    Map<String, String> contextMsg = new HashMap<>();
                    contextMsg.put("role", "system");
                    contextMsg.put("content", "Thông tin cập nhật về menu và bàn:\n" + menuContext);
                    // Find index of last user message and insert before it
                    int lastUserIndex = aiMessages.size() - 1;
                    for (int i = aiMessages.size() - 1; i >= 0; i--) {
                        if ("user".equals(aiMessages.get(i).get("role"))) {
                            lastUserIndex = i;
                            break;
                        }
                    }
                    aiMessages.add(lastUserIndex, contextMsg);
                } else if (lowerMessage.contains("bàn") || lowerMessage.contains("đặt bàn") ||
                          lowerMessage.matches(".*\\d+.*người.*") || lowerMessage.matches(".*\\d+.*khách.*")) {
                    // Extract guest number if mentioned
                    java.util.regex.Pattern pattern = java.util.regex.Pattern.compile("(\\d+)\\s*(người|khách)");
                    java.util.regex.Matcher matcher = pattern.matcher(lowerMessage);
                    if (matcher.find()) {
                        int guestNumber = Integer.parseInt(matcher.group(1));
                        String tableInfo = contextService.getAvailableTablesInfo(guestNumber);
                        Map<String, String> contextMsg = new HashMap<>();
                        contextMsg.put("role", "system");
                        contextMsg.put("content", "Thông tin bàn phù hợp:\n" + tableInfo);
                        // Find index of last user message and insert before it
                        int lastUserIndex = aiMessages.size() - 1;
                        for (int i = aiMessages.size() - 1; i >= 0; i--) {
                            if ("user".equals(aiMessages.get(i).get("role"))) {
                                lastUserIndex = i;
                                break;
                            }
                        }
                        aiMessages.add(lastUserIndex, contextMsg);
                    }
                }
            }

                    // Call Gemini AI
                    log.info("Calling Gemini AI for conversation: {}", conversationId);
                    String aiResponse = geminiAIService.generateContent(aiMessages, "google/gemini-2.0-flash-001");
                    log.info("Gemini AI response received");

                    // Remove emoji and special characters from AI response, then format with line breaks
                    String cleanedResponse = cleanText(aiResponse);
                    cleanedResponse = formatTextWithLineBreaks(cleanedResponse);

                    // Save assistant message
                    ChatMessage assistantMessage = new ChatMessage();
                    assistantMessage.setConversation(conversation);
                    assistantMessage.setRole("assistant");
                    assistantMessage.setContent(cleanedResponse);
                    assistantMessage.setModel("google/gemini-2.0-flash-001");
                    messageRepository.save(assistantMessage);

                    // Update conversation's updatedAt timestamp
                    conversation.setUpdatedAt(java.time.LocalDateTime.now());
                    conversationRepository.save(conversation);

                    log.info("Assistant message saved successfully, conversation updated");
                    return null;
                } catch (Exception e) {
                    log.error("Error in transaction for AI response", e);
                    status.setRollbackOnly();
                    throw new RuntimeException(e);
                }
            });
        } catch (Exception e) {
            log.error("Error processing AI response", e);
        }
    }

    @Transactional
    public void deleteConversation(Long conversationId, String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        conversationRepository.deleteByIdAndUser(conversationId, user);
    }

    private ChatConversationResponse mapToConversationResponse(ChatConversation conversation) {
        List<ChatMessage> messages = messageRepository.findByConversationOrderByCreatedAtAsc(conversation);
        List<ChatMessageResponse> messageResponses = messages.stream()
                .map(this::mapToMessageResponse)
                .collect(Collectors.toList());

        return ChatConversationResponse.builder()
                .id(conversation.getId())
                .title(conversation.getTitle())
                .createdAt(conversation.getCreatedAt())
                .updatedAt(conversation.getUpdatedAt())
                .messages(messageResponses)
                .build();
    }

    private ChatMessageResponse mapToMessageResponse(ChatMessage message) {
        return ChatMessageResponse.builder()
                .id(message.getId())
                .role(message.getRole())
                .content(message.getContent())
                .model(message.getModel())
                .createdAt(message.getCreatedAt())
                .build();
    }

    /**
     * Clean text by removing emoji, asterisks, and other markdown formatting
     */
    private String cleanText(String text) {
        if (text == null || text.isEmpty()) {
            return text;
        }
        
        // Remove emoji using comprehensive Unicode ranges
        StringBuilder cleaned = new StringBuilder();
        char[] chars = text.toCharArray();
        
        for (int i = 0; i < chars.length; i++) {
            char c = chars[i];
            
            // Skip emoji surrogate pairs (most emojis are 2 chars)
            if (i < chars.length - 1 && 
                Character.isHighSurrogate(c) && 
                Character.isLowSurrogate(chars[i + 1])) {
                // Skip both characters of the surrogate pair
                i++;
                continue;
            }
            
            // Skip single character emojis in common ranges
            if ((c >= 0x1F300 && c <= 0x1F9FF) ||  // Miscellaneous Symbols and Pictographs
                (c >= 0x2600 && c <= 0x26FF) ||    // Miscellaneous Symbols
                (c >= 0x2700 && c <= 0x27BF) ||    // Dingbats
                (c >= 0xFE00 && c <= 0xFE0F) ||    // Variation Selectors
                (c >= 0x203C && c <= 0x3299) ||    // Various symbols
                c == 0x00A9 || c == 0x00AE || c == 0x2122 || c == 0x2139) {  // Copyright, Registered, TM, Info
                continue;
            }
            
            // Skip asterisk (*) used for markdown formatting
            if (c == '*') {
                continue;
            }
            
            cleaned.append(c);
        }
        
        // Remove markdown patterns like **text** or *text*
        String result = cleaned.toString()
                .replaceAll("\\*\\*([^*]+)\\*\\*", "$1")  // Remove **bold**
                .replaceAll("\\*([^*]+)\\*", "$1")       // Remove *italic*
                .replaceAll("\\*+", "")                   // Remove any remaining asterisks
                .replaceAll("\\s+", " ")                 // Clean up multiple spaces
                .trim();
        
        return result;
    }

    /**
     * Format text with proper line breaks for better readability
     */
    private String formatTextWithLineBreaks(String text) {
        if (text == null || text.isEmpty()) {
            return text;
        }
        
        // Ensure menu categories have line breaks before them
        text = text.replaceAll("(MENU:|COMBO:)", "\n$1\n");
        
        // Format menu category headers (Món súp:, Món bò:, etc.) - add line break before
        text = text.replaceAll("([^\\n])(Món [^:]+:)", "$1\n\n$2");
        
        // Format menu items - ensure each item starts on new line after category
        // Pattern: "Món X:\n  - Tên món - Giá: X VNĐ"
        // Add line break before each dash item if not already there
        text = text.replaceAll("([^\\n])(\\s+-\\s+)", "$1\n$2");
        
        // CRITICAL: Keep price on same line as menu item (but NOT for combos)
        // IMPORTANT: Process combos FIRST to preserve their format, then process regular items
        
        // Step 1: Protect combo format - ensure price stays on separate line for combos
        // Pattern: Combo name followed by newline and "Giá:" -> keep as is (don't merge)
        // This ensures combos keep their format: "  - Combo X\n    Giá: Y VNĐ"
        
        // Step 2: For regular menu items (not combos), merge price to same line
        // Pattern 1: Item name on one line, "Giá:" on next line -> merge to same line (only for regular items, not combos)
        // Use negative lookahead to exclude items starting with "Combo"
        text = text.replaceAll("(\\s+-\\s+(?!Combo)[^\\n]+)\\n\\s+Giá:", "$1 - Giá:");
        // Pattern 2: Item name with colon, description, then "Giá:" on next line -> merge to same line (not for combos)
        text = text.replaceAll("(\\s+-\\s+(?!Combo)[^\\n]+):\\s*([^\\n]+)\\n\\s+Giá:", "$1: $2 - Giá:");
        // Pattern 3: Any line break before "Giá:" after a dash item -> remove it (not for combos)
        text = text.replaceAll("(\\s+-\\s+(?!Combo)[^\\n]+)\\s+\\n\\s+Giá:", "$1 - Giá:");
        
        // Step 2.5: Ensure combo price doesn't have "-" before "Giá:" (should be just "Giá:")
        // Remove any "-" that might appear before "Giá:" on a line with indent (combo format)
        text = text.replaceAll("(\\s+)-\\s+Giá:", "$1Giá:");
        // Pattern 4: Category name followed by "Giá:" on next line (shouldn't happen but just in case)
        text = text.replaceAll("([^\\n]+:)\\s+\\n\\s+Giá:", "$1");
        
        // Step 3: Ensure line breaks between combo items (after VNĐ and before next dash item)
        // This ensures proper spacing between combos
        text = text.replaceAll("([0-9.,]+\\s*VNĐ[^\\n]*)\\n\\s+(\\s+-\\s+)", "$1\n\n$2");
        
        // Format numbered list items (1., 2., etc.) - add line break before each
        text = text.replaceAll("([^\\n])(\\d+\\.\\s+)", "$1\n\n$2");
        
        // Format table information - add line breaks for better readability
        // Pattern: "Bàn X (Y người)" followed by details
        text = text.replaceAll("([^\\n])(Bàn [^\\n]+\\s+\\(\\d+\\s+người\\))", "$1\n$2");
        
        // Add line break after price (VNĐ) when followed by new item or category
        text = text.replaceAll("([0-9.,]+\\s*VNĐ)\\s+([A-ZĐ])", "$1\n\n$2");
        text = text.replaceAll("([0-9.,]+\\s*VNĐ)\\s+(\\d+\\.)", "$1\n\n$2");
        text = text.replaceAll("([0-9.,]+\\s*VNĐ)\\s+(\\s+-)", "$1\n$2");
        
        // Add line break before "Hoặc" when starting a new question
        text = text.replaceAll("([^\\n])(Hoặc bạn|Hoặc)", "$1\n\n$2");
        
        // Add line break after "nhé:" or similar list introducers
        text = text.replaceAll("(nhé|như sau|sau đây|như sau đây):", "$1:\n");
        
        // Add line break after question marks
        text = text.replaceAll("\\?\\s+", "?\n");
        
        // Add line break after colons when followed by a question or list item
        text = text.replaceAll("(:)\\s+(Số lượng|Bạn có|Vui lòng|Có|Không có|Ví dụ|Mỗi|Sau)", "$1\n$2");
        
        // Add line break before common question patterns
        text = text.replaceAll("([^\\n])(Số lượng khách|Ngày muốn đặt|Giờ muốn đến|Bạn có yêu cầu|Vui lòng cho tôi|Có yêu cầu đặc biệt)", "$1\n$2");
        
        // Add line break after periods if followed by capital letter (new sentence)
        text = text.replaceAll("\\.\\s+([A-ZĐ])", ".\n\n$1");
        
        // Add line break after common phrases that start new topics
        text = text.replaceAll("([^\\n])(Tuyệt vời|Cảm ơn|Để hoàn tất|Sau khi có đủ thông tin)", "$1\n\n$2");
        
        // Format table listings - ensure each table detail is on a new line
        text = text.replaceAll("(Bàn [^\\n]+)\\s+ở\\s+(tầng|Tầng)\\s+(\\d+),\\s+(khu vực|Khu vực)\\s+([^\\n\\.]+)", "$1\n   - $2 $3, $4 $5");
        
        // Format numbered lists (1. Bàn X, 2. Bàn Y) - ensure each on new line
        text = text.replaceAll("([^\\n])(\\d+\\.\\s+Bàn[^\\n]+)", "$1\n$2");
        
        // Add line break before "Bạn thích" or similar questions after table list
        text = text.replaceAll("([^\\n])(Bạn thích|Bạn muốn|Bạn có muốn)", "$1\n\n$2");
        
        // Clean up multiple consecutive line breaks (max 2)
        text = text.replaceAll("\\n{3,}", "\n\n");
        
        return text.trim();
    }
}
