# AI Chatbot Flow - CrownDine Restaurant

## Tổng quan

Hệ thống AI Chatbot của CrownDine được tích hợp với Gemini AI và OpenRouter để hỗ trợ khách hàng đặt bàn và đặt món trực tuyến. Chatbot có khả năng tự động chuyển hướng khách hàng đến các bước đặt bàn phù hợp.

## Kiến trúc hệ thống

### Backend Components

1. **ChatService** (`com.crowndine.service.chat.ChatService`)
   - Quản lý conversations và messages
   - Xử lý logic đặt bàn và tích hợp với AI
   - Tạo và quản lý context từ database

2. **GeminiAIService** (`com.crowndine.service.gemini.GeminiAIService`)
   - Gọi API Gemini và OpenRouter
   - Hỗ trợ multiple API keys với round-robin rotation
   - Fallback mechanism khi một key fail

3. **ChatContextService** (`com.crowndine.service.chat.ChatContextService`)
   - Lấy thông tin menu, combo, bàn từ database
   - Format context cho AI prompt
   - Cung cấp thông tin bàn phù hợp theo số lượng khách

### Frontend Components

1. **ChatWidget** (`frontend/src/components/Chat/ChatWidget.tsx`)
   - Floating chat widget hiển thị trên mọi trang
   - Tự động detect và navigate khi có link reservation
   - Polling để cập nhật messages mới

2. **Reservation Page** (`frontend/src/pages/Reservation/Reservation.tsx`)
   - Xử lý query parameters từ chatbot
   - Tự động match bàn và tạo reservation
   - Chuyển thẳng đến step 3 hoặc 4

## Luồng hoạt động chính

### 1. Khởi tạo Conversation

```
User mở chat widget
  ↓
Frontend gọi API: POST /api/chat/conversations
  ↓
Backend tạo ChatConversation với system message
  ↓
System message chứa:
  - Vai trò và nguyên tắc của chatbot
  - Dữ liệu nhà hàng (menu, bàn, giá cả)
  - Quy trình đặt bàn
```

### 2. Flow đặt bàn cơ bản

```
Step 1: Khách hỏi về đặt bàn
  User: "đặt bàn 4 người ngày mai 17h-19h"
  ↓
Step 2: AI phân tích và hỏi thêm thông tin (nếu cần)
  AI: "Tuyệt vời! Để tôi kiểm tra bàn phù hợp..."
  ↓
Step 3: AI đề xuất bàn
  AI: "Tôi đề xuất Bàn 01 ở tầng 1, khu vực Sảnh chính..."
  ↓
Step 4: Xác nhận thông tin
  AI: "Vậy bạn xác nhận đặt Bàn 01 cho 4 người..."
```

### 3. Flow đặt món hoặc thanh toán

```
Sau khi khách xác nhận đặt bàn:
  ↓
AI hỏi: "Bạn có muốn đặt món trước không?"
  ↓
┌─────────────────┬──────────────────────┐
│   Khách: Có    │   Khách: Không       │
└─────────────────┴──────────────────────┘
        ↓                    ↓
  AI trả về link        AI hỏi: "Bạn có muốn
  step=3 (ẩn link)      chuyển đến thanh toán?"
                              ↓
                        Khách: "xác nhận"
                              ↓
                        AI trả về link
                        step=4 (ẩn link)
```

### 4. Tự động chuyển hướng

```
AI trả về message với link ở cuối (ẩn):
  "Tuyệt vời! Tôi sẽ chuyển bạn đến trang đặt món ngay bây giờ.
  /reservation?step=3&tableName=Bàn 01&date=2025-01-20&startTime=17:00&endTime=19:00&guests=4"
  ↓
ChatWidget detect link trong message
  ↓
Tự động navigate sau 1.5 giây
  ↓
Reservation page đọc query parameters
  ↓
Tự động:
  - Điền form (date, time, guests)
  - Tìm và match bàn theo tên
  - Tạo reservation
  - Chuyển thẳng đến step 3 hoặc 4
```

## Chi tiết các bước

### Bước 1: Thu thập thông tin

**Input từ User:**
- Số lượng khách
- Ngày muốn đặt
- Giờ muốn đến
- Yêu cầu đặc biệt (nếu có)

**AI xử lý:**
- Parse thông tin từ message
- Validate thông tin
- Hỏi thêm nếu thiếu

**Context được inject:**
- Thông tin menu và giá cả
- Danh sách bàn phù hợp với số lượng khách
- Thông tin tầng và khu vực

### Bước 2: Đề xuất bàn

**AI sử dụng context:**
```java
ChatContextService.getAvailableTablesInfo(guestNumber)
```

**Output format:**
```
1. Bàn 01 (4 người)
   - Tầng 1, khu vực Sảnh chính
   - Đặt cọc: 100000 VNĐ

2. Bàn 02 (4 người)
   - Tầng 1, khu vực Sảnh chính
   - Đặt cọc: 100000 VNĐ
```

**AI đề xuất:**
- Bàn phù hợp với số lượng khách
- Hiển thị đầy đủ thông tin (tên, tầng, khu vực)
- Format dễ đọc với line breaks

### Bước 3: Xác nhận và chuyển hướng

**Khi khách xác nhận:**

1. **Nếu muốn đặt món:**
   ```
   AI: "Tuyệt vời! Tôi sẽ chuyển bạn đến trang đặt món ngay bây giờ."
   [Link ẩn]: /reservation?step=3&tableName=Bàn 01&date=2025-01-20&startTime=17:00&endTime=19:00&guests=4
   ```

2. **Nếu không đặt món:**
   ```
   AI: "Bạn có muốn chuyển đến bước thanh toán đặt cọc không?"
   Khách: "xác nhận"
   AI: "Tuyệt vời! Tôi sẽ chuyển bạn đến trang thanh toán đặt cọc ngay bây giờ."
   [Link ẩn]: /reservation?step=4&tableName=Bàn 01&date=2025-01-20&startTime=17:00&endTime=19:00&guests=4
   ```

**Link format:**
```
/reservation?step={3|4}&tableName={Tên bàn}&date={YYYY-MM-DD}&startTime={HH:mm}&endTime={HH:mm}&guests={Số khách}
```

### Bước 4: Xử lý trên Reservation Page

**Khi có query parameters:**

1. **Đọc parameters:**
   - `step`: 3 (đặt món) hoặc 4 (thanh toán)
   - `tableName`: Tên bàn (ví dụ: "Bàn 01")
   - `date`: Ngày đặt (YYYY-MM-DD)
   - `startTime`: Giờ bắt đầu (HH:mm)
   - `endTime`: Giờ kết thúc (HH:mm)
   - `guests`: Số lượng khách

2. **Tự động điền form:**
   ```typescript
   setDate(targetDate)
   setStartTime(targetStartTime)
   setEndTime(targetEndTime)
   setGuests(parseInt(targetGuests))
   ```

3. **Tìm và match bàn:**
   ```typescript
   // Get available tables
   const res = await layoutApi.getAvailableTables({...})
   
   // Find table by name (fuzzy match)
   const foundTable = res.data.data.find((t) => {
     // Multiple matching strategies
     return normalizedTName === normalizedTableName || 
            normalizedTName.includes(normalizedTableName) || 
            normalizedTableName.includes(normalizedTName)
   })
   ```

4. **Tạo reservation:**
   ```typescript
   const reservationRes = await reservationApi.createReservation({
     date, startTime, endTime,
     guestNumber: guests,
     tableId: foundTable.id,
     note: ''
   })
   ```

5. **Chuyển đến step:**
   - Step 3: Hiển thị menu để đặt món
   - Step 4: Hiển thị form thanh toán đặt cọc

## System Prompt Structure

### Vai trò và nguyên tắc

```
Bạn là trợ lý AI thông minh của nhà hàng CrownDine, chuyên hỗ trợ khách hàng đặt bàn.

Vai trò:
1. Hỗ trợ khách hàng đặt bàn một cách thân thiện và chuyên nghiệp
2. Thu thập thông tin cần thiết: số lượng khách, ngày giờ, yêu cầu đặc biệt
3. Gợi ý bàn phù hợp dựa trên số lượng khách
4. Trả lời các câu hỏi về menu, dịch vụ, giờ mở cửa
5. Hướng dẫn quy trình đặt bàn
```

### Quy trình đặt bàn

```
1. Xác nhận lại thông tin đặt bàn:
   - Tên bàn
   - Tầng và khu vực
   - Số lượng khách
   - Ngày và giờ đặt bàn

2. Hỏi khách có muốn đặt món trước không

3. Tạo link chuyển hướng khi khách xác nhận:
   - Link step=3 nếu đặt món
   - Link step=4 nếu thanh toán đặt cọc
   - Link phải ở cuối message (ẩn khỏi display)
```

### Context Injection

**Menu Context:**
- Danh sách món ăn với giá cả
- Danh sách combo với giá cả
- Thông tin về món đặc biệt

**Table Context:**
- Danh sách bàn phù hợp với số lượng khách
- Thông tin tầng và khu vực
- Giá đặt cọc

## API Endpoints

### Chat Endpoints

```
POST   /api/chat/conversations          - Tạo conversation mới
GET    /api/chat/conversations          - Lấy danh sách conversations
GET    /api/chat/conversations/{id}     - Lấy conversation theo ID
DELETE /api/chat/conversations/{id}     - Xóa conversation
POST   /api/chat/messages               - Gửi message
```

### Request/Response Format

**Create Conversation:**
```json
POST /api/chat/conversations
{
  "title": "Cuộc trò chuyện mới"
}
```

**Send Message:**
```json
POST /api/chat/messages
{
  "conversationId": 1,
  "content": "đặt bàn 4 người ngày mai 17h-19h"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": 123,
    "role": "user",
    "content": "đặt bàn 4 người ngày mai 17h-19h",
    "createdAt": "2025-01-20T15:00:00"
  }
}
```

## Database Schema

### chat_conversations

```sql
CREATE TABLE chat_conversations (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    user_id BIGINT NOT NULL,
    title VARCHAR(255),
    created_at DATETIME(6),
    updated_at DATETIME(6),
    FOREIGN KEY (user_id) REFERENCES users(id)
) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

### chat_messages

```sql
CREATE TABLE chat_messages (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    conversation_id BIGINT NOT NULL,
    role VARCHAR(20) NOT NULL,  -- 'system', 'user', 'assistant'
    content TEXT NOT NULL,
    model VARCHAR(100),
    created_at DATETIME(6),
    updated_at DATETIME(6),
    FOREIGN KEY (conversation_id) REFERENCES chat_conversations(id) ON DELETE CASCADE
) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

## AI Model Configuration

### Gemini API Keys

- Hỗ trợ multiple API keys với round-robin rotation
- Fallback mechanism khi một key fail
- Fallback to OpenRouter nếu tất cả Gemini keys fail

### Model Used

- Primary: `google/gemini-2.0-flash-001`
- Fallback: OpenRouter models

## Text Processing

### Clean Text

- Loại bỏ emoji và special characters
- Loại bỏ markdown formatting (*, **)
- Normalize whitespace

### Format Text

- Thêm line breaks cho readability
- Format menu items với proper indentation
- Format table information với line breaks

## Error Handling

### API Failures

- Retry với key khác nếu một key fail
- Fallback to OpenRouter
- Log errors để debug

### Database Errors

- Transaction management với TransactionTemplate
- Rollback nếu có lỗi
- Proper error messages cho user

## Security Considerations

1. **Authentication:**
   - Chỉ authenticated users mới có thể sử dụng chatbot
   - User chỉ có thể xem conversations của chính mình

2. **Input Validation:**
   - Validate message content
   - Sanitize user input
   - Prevent SQL injection

3. **Rate Limiting:**
   - Consider implementing rate limiting cho API calls
   - Prevent abuse

## Future Enhancements

1. **Voice Support:**
   - Tích hợp voice input/output
   - Speech-to-text và text-to-speech

2. **Multi-language:**
   - Hỗ trợ nhiều ngôn ngữ
   - Auto-detect language

3. **Analytics:**
   - Track conversation metrics
   - Analyze user behavior
   - Improve AI responses

4. **Integration:**
   - Tích hợp với hệ thống notification
   - Email/SMS confirmations
   - Calendar integration

## Troubleshooting

### Link không tự động navigate

**Nguyên nhân:**
- Link không được detect đúng format
- Regex không match

**Giải pháp:**
- Kiểm tra console log để xem link có được detect không
- Verify link format trong message
- Check regex pattern trong ChatWidget

### Bàn không được match

**Nguyên nhân:**
- Tên bàn không khớp
- Bàn không available trong time slot

**Giải pháp:**
- Cải thiện fuzzy matching logic
- Check available tables API response
- Verify table name format

### AI không trả về link

**Nguyên nhân:**
- System prompt không đủ rõ ràng
- AI không hiểu context

**Giải pháp:**
- Cải thiện system prompt với ví dụ cụ thể
- Thêm more explicit instructions
- Check AI response trong logs

## References

- [Gemini API Documentation](https://ai.google.dev/docs)
- [OpenRouter API Documentation](https://openrouter.ai/docs)
- [React Router Documentation](https://reactrouter.com/)
