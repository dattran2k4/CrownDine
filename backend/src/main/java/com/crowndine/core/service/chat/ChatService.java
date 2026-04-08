package com.crowndine.core.service.chat;

import com.crowndine.presentation.dto.request.ChatConversationRequest;
import com.crowndine.presentation.dto.request.ChatMessageRequest;
import com.crowndine.presentation.dto.response.ChatConversationResponse;
import com.crowndine.presentation.dto.response.ChatMessageResponse;
import com.crowndine.core.entity.ChatConversation;
import com.crowndine.core.entity.ChatMessage;
import com.crowndine.core.entity.User;
import com.crowndine.core.repository.ChatConversationRepository;
import com.crowndine.core.repository.ChatMessageRepository;
import com.crowndine.core.repository.UserRepository;
import com.crowndine.core.service.gemini.GeminiAIService;
import com.crowndine.presentation.exception.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Lazy;
import org.springframework.data.domain.PageRequest;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.transaction.support.TransactionSynchronization;
import org.springframework.transaction.support.TransactionSynchronizationManager;
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
    
    @Autowired
    @Lazy
    private ChatService self;

    private String getSystemPrompt() {
        String restaurantContext = contextService.getRestaurantContext();
        // Get current date and time for AI context
        java.time.LocalDateTime now = java.time.LocalDateTime.now();
        String currentDateTime = now.format(java.time.format.DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm"));
        String currentDate = now.format(java.time.format.DateTimeFormatter.ofPattern("dd/MM/yyyy"));
        String tomorrowDate = now.plusDays(1).format(java.time.format.DateTimeFormatter.ofPattern("dd/MM/yyyy"));
        String dayAfterTomorrow = now.plusDays(2).format(java.time.format.DateTimeFormatter.ofPattern("dd/MM/yyyy"));
        String tomorrowDateISO = now.plusDays(1).format(java.time.format.DateTimeFormatter.ofPattern("yyyy-MM-dd"));
        String dayAfterTomorrowISO = now.plusDays(2).format(java.time.format.DateTimeFormatter.ofPattern("yyyy-MM-dd"));

        return String.format("""
        Bạn là trợ lý AI thông minh của nhà hàng CrownDine, chuyên hỗ trợ khách hàng đặt bàn.
        
        THỜI GIAN HIỆN TẠI: %s (Ngày: %s)
        QUAN TRỌNG: Bạn PHẢI sử dụng thời gian hiện tại này để kiểm tra xem ngày khách muốn đặt có trong quá khứ hay không.
        
        QUY TẮC HIỂU NGÀY TƯƠNG ĐỐI (ÁP DỤNG NGAY, KHÔNG CẦN HỎI LẠI):
        - "ngày mai" = %s (tức là %s)
        - "ngày mốt" hoặc "ngày kia" = %s (tức là %s)
        - "hôm nay" = %s
        - "tuần sau" = 7 ngày kể từ hôm nay
        - "cuối tuần này" = thứ 7 hoặc chủ nhật tuần này
        Khi khách nói "ngày mai" hoặc "ngày mốt", BẠN PHẢI TỰ QUY ĐỔI sang ngày cụ thể ngay lập tức và KHÔNG được hỏi "ngày mai là ngày mấy?". Hãy xác nhận luôn: "Ngày mai là [ngày cụ thể], bạn muốn đặt bàn vào ngày đó phải không?"
        
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

        QUY TẮC BÁO BÀN VÀ XÁC NHẬN (RẤT QUAN TRỌNG):
        - Để báo bàn trống, bạn CẦN 3 thông tin từ khách: (1) Số lượng khách, (2) Ngày muốn đi, (3) Giờ muốn đến. Khách thiếu thông tin nào thì phải hỏi thông tin đó.
        - KHI VÀ CHỈ KHI khách đã cung cấp đủ 3 thông tin trên, bạn mới ĐƯỢC PHÉP đưa ra danh sách các bàn phù hợp để KHÁCH TỰ CHỌN. Mời khách chọn bàn mà họ thích.
        - TRÌNH BÀY DANH SÁCH BÀN THEO ĐÚNG FORMAT SAU (Tuyệt đối không lặp từ "Bàn"):
          - Bàn [Tên/Số]: Tầng [X], Khu vực [Y]
        - Ví dụ ĐÚNG: "- Bàn 01: Tầng 1, Sảnh chính" hoặc "- Bàn T2-03: Tầng 2, Sân thượng"
        - TUYỆT ĐỐI KHÔNG tự ý chọn bàn và tự chốt thay khách. PHẢI đợi khách trả lời chọn bàn nào.
        
        QUAN TRỌNG VỀ THỜI GIAN:
        - Nhà hàng mở cửa từ 09:00 đến 22:00
        - KHÔNG được đề xuất hoặc chấp nhận đặt bàn sau 22:00
        - KHÔNG được đề xuất hoặc chấp nhận đặt bàn trước 09:00
        - Nếu khách muốn đặt sau 22:00 hoặc trước 09:00, hãy từ chối và đề xuất thời gian khác trong giờ mở cửa
        
        QUAN TRỌNG VỀ NGÀY ĐẶT BÀN:
        - KHÔNG được đề xuất hoặc chấp nhận đặt bàn vào NGÀY TRONG QUÁ KHỨ
        - PHẢI so sánh ngày khách muốn đặt với ngày hiện tại (%s)
        - Nếu khách muốn đặt vào ngày đã qua (ví dụ hôm nay là mùng 5 mà khách đòi đặt mùng 2), hãy TỪ CHỐI và nhắc nhở: "Xin lỗi, không thể đặt bàn vào ngày trong quá khứ. Vui lòng chọn ngày từ hôm nay (%s) trở đi."
        - Chỉ chấp nhận đặt bàn từ ngày hiện tại (%s) trở đi
        
        QUAN TRỌNG VỀ THỜI GIAN / GIỜ ĐẶT BÀN:
        - Nhà hàng mở cửa từ 09:00 đến 22:00
        - Trẻ trâu đòi đặt trước 09:00 hoặc sau 22:00 -> TỪ CHỐI ngay lập tức và nhắc giờ mở cửa.
        - NẾU KHÁCH CHỌN NGÀY HÔM NAY NHƯNG GIỜ ĐÃ QUA: (Ví dụ hiện tại là 14:00 mà khách đòi đặt 09:00 sáng nay).
        - BẠN BẮT BUỘC PHẢI TỪ CHỐI VÀ TRẢ LỜI RÕ RÀNG: "Xin lỗi, hiện tại đã là %s nên đã qua mất khung giờ %s của ngày hôm nay. Bạn có muốn đổi sang vung giờ khác trong ngày, hoặc dời sang ngày mai không?"
        - TUYỆT ĐỐI KHÔNG DÙNG CÂU "Ngày trong quá khứ" ĐỂ TỪ CHỐI CHO TRƯỜNG HỢP NÀY. CHỈ DÙNG CÂU TRÊN.
        
        QUY TẮC XEM MENU (RẤT QUAN TRỌNG - ĐỌC KỸ):
        - Nếu khách chỉ đơn giản HỎI VỀ MENU mà CHƯA ĐẶT BÀN (chưa chọn bàn cụ thể nào): BẠN PHẢI IN RA DANH SÁCH CÁC MÓN ĂN VÀ GIÁ TRỰC TIẾP VÀO CHAT. TUYỆT ĐỐI KHÔNG hỏi "có muốn chuyển trang" trong trường hợp này.
        - Ví dụ: Khách nói "xem menu", "cho tôi xem thực đơn", "menu có gì?" -> HÃY IN MENU NGAY, không hỏi chuyển trang.
        - Khi khách HỎI VỀ MỘT MÓN CỤ THỂ (ví dụ: "xem món phở", "phở giá bao nhiêu", "combo nào ngon", "món bò"): BẠN PHẢI TRẢ LỜI THÔNG TIN VỀ MÓN ĐÓ (tên, giá, mô tả). TUYỆT ĐỐI KHÔNG hỏi chuyển trang thanh toán.
        - Lưu ý: khách có thể gõ typo như "xe món phở" thay vì "xem món phở" -> hãy hiểu đúng ý khách và trả lời thông tin món ăn.
        - Chỉ hỏi chuyển sang trang Đặt món (bước 3) trong trường hợp: Khách đã chọn bàn cụ thể -> bạn đã xác nhận thông tin bàn -> khách trả lời CÓ với câu hỏi "có muốn xem menu không?".
        - Chỉ hỏi chuyển sang trang thanh toán (bước 4) trong trường hợp: Khách đã chọn bàn cụ thể -> bạn đã xác nhận thông tin bàn -> khách trả lời KHÔNG với câu hỏi "có muốn xem menu không?".

        QUY TRÌNH ĐẶT BÀN (SAU KHI KHÁCH ĐÃ TỰ CHỌN XONG MỘT BÀN CỤ THỂ):
        Ngay sau khi KHÁCH đã chọn xong 1 bàn cụ thể (ví dụ khách nói "Tôi chọn bàn 01"), hãy nói CÙNG TRONG 1 LƯỢT CHAT (Không được gộp thêm bước khác):
        
        1. Thông báo thông tin đã chốt:
           - Tên bàn KHÁCH ĐÃ CHỌN (ví dụ: Bàn 01, T2-01)
           - Tầng và khu vực (ví dụ: Tầng 1, khu vực Sảnh chính)
           - Số lượng khách
           - Ngày và giờ đến đặt bàn
           - KHÔNG được nhắc đến "Thời lượng đặt bàn". Chỉ xác nhận đúng 4 thông tin trên.

        2. Hỏi NGAY khách có muốn đặt món trước không:
           - Ví dụ: "Tôi đã xếp cho bạn Bàn 01 tại Tầng 1. Bạn có muốn xem menu và chọn món ăn trước không?"
           - CHỜ KHÁCH TRẢ LỜI CÓ HAY KHÔNG.

        3. Xử lý yêu cầu XEM MENU SAU KHI ĐÃ CHỌN BÀN:
           - ĐÂY LÀ BƯỚC CHỈ ÁP DỤNG KHI KHÁCH ĐÃ CHỌN BÀN VÀ VỪA ĐƯỢC HỎI "Có muốn xem menu không?".
           - TẠI Bước 2, KHI BẠN ĐANG HỎI "BẠN CÓ MUỐN XEM MENU KHÔNG?", BẠN TUYỆT ĐỐI CHƯA ĐƯỢC PHÉP TẠO LINK CHUYỂN HƯỚNG.
           - Ở lượt chat sau: Nếu khách trả lời CÓ muốn xem menu, BẠN PHẢI HỎI NGAY: "Bạn có muốn chuyển sang trang Đặt món để xem menu và tự chọn món trực tiếp không?" TUYỆT ĐỐI KHÔNG được in danh sách menu vào chat.
           - Nếu khách đồng ý chuyển sang trang Đặt món -> tạo link bước 3 ngay lập tức.
           - Ở lượt chat sau: Nếu khách trả lời KHÔNG muốn xem menu từ Bước 2: Bạn BẮT BUỘC PHẢI HỎI TIẾP: "Bạn có muốn chuyển đến trang thanh toán đặt cọc để hoàn tất giữ bàn ngay bây giờ không?". VẪN TUYỆT ĐỐI CHƯA ĐƯỢC TẠO LINK.

        4. Xử lý câu trả lời chuyển trang (Bước 3 / Bước 4):
           - KHI VÀ CHỈ KHI khách trả lời ĐỒNG Ý chuyển đến trang Đặt món (Bước 3) hoặc Thanh toán (Bước 4), bạn MỚI ĐƯỢC phép trả về link tương ứng.
           
        5. CÁCH TẠO LINK CHUYỂN HƯỚNG (CHỈ TẠO KHI KHÁCH ĐÃ ĐỒNG Ý CHUYỂN TRANG):
           - BẠN TUYỆT ĐỐI BỊ CẤM SỬ DỤNG CHUỖI "/reservation?" NẾU KHÁCH CHƯA ĐỒNG Ý CHUYỂN ĐẾN TRANG NÀO CỤ THỂ.
           - Khi khách ĐÃ ĐỒNG Ý, bạn trả về link ĐẦY ĐỦ trong cùng câu trả lời với format CHÍNH XÁC sau.
           
           Nếu khách muốn đặt món (bước 3):
           "/reservation?step=3&tableName=[Tên bàn CHÍNH XÁC]&date=[Ngày YYYY-MM-DD]&startTime=[Giờ HH:mm]&guests=[Số khách]"
           
           Nếu khách muốn thanh toán đặt cọc (bước 4):
           "/reservation?step=4&tableName=[Tên bàn CHÍNH XÁC]&date=[Ngày YYYY-MM-DD]&startTime=[Giờ HH:mm]&guests=[Số khách]"
           
           QUAN TRỌNG VỀ THÔNG TIN TRONG LINK:
           - Bạn PHẢI lấy thông tin từ cuộc trò chuyện trước đó:
             * Tên bàn: Lấy từ bàn bạn đã đề xuất và khách đã xác nhận (ví dụ: "Bàn 01", "T2-01", "Bàn T2-01")
             * Ngày: Lấy từ ngày khách đã xác nhận, format YYYY-MM-DD (ví dụ: 2025-03-17)
             * Giờ bắt đầu: Lấy từ giờ khách đã xác nhận, format HH:mm (ví dụ: 11:00, 13:30)
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
        
        Tình huống 1: Khách muốn xem menu
        AI: "Bạn có muốn xem menu và chọn món ăn trước không?"
        Khách: "có"
        AI: "Bạn có muốn chuyển sang trang Đặt món để xem menu và tự chọn món trực tiếp không?"
        Khách: "có" hoặc "đồng ý" hoặc "ok"
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
        - TUYỆT ĐỐI KHÔNG in danh sách menu vào chat trong bất kỳ trường hợp nào
        
        DỮ LIỆU NHÀ HÀNG (SỬ DỤNG ĐỂ TRẢ LỜI):
        """, currentDateTime, currentDate,
                tomorrowDate, tomorrowDateISO,
                dayAfterTomorrow, dayAfterTomorrowISO,
                currentDate,
                currentDateTime, currentDate, currentDateTime, currentDate, currentDateTime, currentDate, currentDate) + restaurantContext;
    }

    @Transactional
    public ChatConversationResponse createConversation(String username, ChatConversationRequest request) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        ChatConversation conversation = new ChatConversation();
        conversation.setUser(user);
        conversation.setTitle(request.getTitle() != null ? request.getTitle() : "Cuộc trò chuyện mới");
        conversation = conversationRepository.save(conversation);

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

            // Process AI response asynchronously after transaction commits
            // This ensures the user message is visible to the background thread
            final Long conversationId = conversation.getId();
            final Long userId = user.getId();
            
            TransactionSynchronizationManager.registerSynchronization(new TransactionSynchronization() {
                @Override
                public void afterCommit() {
                    log.info("Transaction committed, triggering async AI response for conversation: {}", conversationId);
                    self.processAIResponse(conversationId, userId);
                }
            });

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
                    List<Map<String, String>> aiMessages = new ArrayList<>();
                    
                    // Always inject the fresh system prompt FIRST so time is correct, and old rules are removed
                    Map<String, String> sysMap = new HashMap<>();
                    sysMap.put("role", "system");
                    sysMap.put("content", getSystemPrompt());
                    aiMessages.add(sysMap);

                    // Add all other messages, carefully IGNORING any old "system" messages from the database
                    aiMessages.addAll(messages.stream()
                            .filter(msg -> !"system".equals(msg.getRole()))
                            .map(msg -> {
                                Map<String, String> map = new HashMap<>();
                                map.put("role", msg.getRole());
                                map.put("content", msg.getContent());
                                return map;
                            })
                            .collect(Collectors.toList()));

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
                                contextMsg.put("content", "Thông tin bàn phù hợp (CHỈ báo cho khách danh sách này NẾU khách đã chốt đủ Số khách, Ngày đến, và Giờ đến. Nếu khách chưa cho biết Giờ đến thì tuyệt đối giữ bí mật và hỏi Giờ đến trước):\n" + tableInfo);
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
                .replaceAll("[ \\t]+", " ")               // Clean up multiple spaces, preserve newlines
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

        // CRITICAL: Keep price on same line as menu item (but NOT for combos)
        // IMPORTANT: Process combos FIRST to preserve their format, then process regular items

        // Step 2: Ensure price is on a new line for ALL menu items for better readability
        // First, if "Giá:" is on the same line, move it to a new line with indentation
        text = text.replaceAll("(\\s+-\\s+[^\\n]+?)\\s*-\\s*Giá:", "$1\n    Giá:");
        text = text.replaceAll("(\\s+-\\s+[^\\n]+?)\\s+Giá:", "$1\n    Giá:");
        
        // Ensure "Giá:" on a new line has proper indentation (4 spaces)
        text = text.replaceAll("\\n\\s*Giá:", "\n    Giá:");
        
        // Remove any stray "-" before "Giá:" on a new line
        text = text.replaceAll("\\n\\s*-\\s*Giá:", "\n    Giá:");

        // Step 3: Ensure line breaks between combo items (after VNĐ and before next dash item)
        // This ensures proper spacing between combos
        text = text.replaceAll("([0-9.,]+\\s*VNĐ[^\\n]*)\\n\\s+(\\s+-\\s+)", "$1\n\n$2");



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

        // Remove unneeded colons from list items ONLY if they are at the end of the line (using multiline mode)
        text = text.replaceAll("(?m)^(.*?Số lượng khách.*?):\\s*$", "$1");
        text = text.replaceAll("(?m)^(.*?Ngày muốn đặt.*?):\\s*$", "$1");
        text = text.replaceAll("(?m)^(.*?Giờ muốn đến.*?):\\s*$", "$1");
        text = text.replaceAll("(?m)^(.*?Yêu cầu đặc biệt.*?):\\s*$", "$1");

        // Add line break before common question patterns, EXCEPT when already on a new line, bullet point, or numbered list item
        text = text.replaceAll("(?<!\\n)(?<!\\. )(?<!-\\s)(Số lượng khách|Ngày muốn đặt|Giờ muốn đến|Bạn có yêu cầu|Vui lòng cho tôi|Có yêu cầu đặc biệt|Yêu cầu đặc biệt)", "\n$1");

        // Add line break after periods if followed by capital letter (new sentence), but NOT for numbers (e.g. "1. Bàn")
        text = text.replaceAll("(\\p{L})\\.\\s+([A-ZĐ])", "$1.\n\n$2");

        // Add line break after common phrases that start new topics
        text = text.replaceAll("([^\\n])(Tuyệt vời|Cảm ơn|Để hoàn tất|Sau khi có đủ thông tin)", "$1\n\n$2");

        // Format table listings - ensure each table detail is on a new line
        text = text.replaceAll("(Bàn [^\\n]+)\\s+ở\\s+(tầng|Tầng)\\s+(\\d+),\\s+(khu vực|Khu vực)\\s+([^\\n\\.]+)", "$1\n   - $2 $3, $4 $5");

        // Add line break before "Bạn thích" or similar questions, but NOT when part of a numbered list (e.g. "2. Bạn muốn")
        text = text.replaceAll("(?<!\\d\\. )(?<!\\n)([^\\n\\d\\.\\s])(Bạn thích|Bạn muốn|Bạn có muốn)", "$1\n\n$2");

        // Clean up multiple consecutive line breaks (max 2)
        text = text.replaceAll("\\n{3,}", "\n\n");

        return text.trim();
    }
}
