import type { ApiResponse } from '@/types/utils.type'
import type { ChatConversation, ChatConversationRequest, ChatMessage, ChatMessageRequest } from '@/types/chat.type'
import http from '@/utils/http'

const CHAT_URL = '/chat'

const chatApi = {
  createConversation(data: ChatConversationRequest) {
    return http.post<ApiResponse<ChatConversation>>(`${CHAT_URL}/conversations`, data)
  },

  listConversations() {
    return http.get<ApiResponse<ChatConversation[]>>(`${CHAT_URL}/conversations`)
  },

  getConversation(conversationId: number) {
    return http.get<ApiResponse<ChatConversation>>(`${CHAT_URL}/conversations/${conversationId}`)
  },

  sendMessage(data: ChatMessageRequest) {
    return http.post<ApiResponse<ChatMessage>>(`${CHAT_URL}/messages`, data)
  },

  deleteConversation(conversationId: number) {
    return http.delete<ApiResponse<void>>(`${CHAT_URL}/conversations/${conversationId}`)
  }
}

export default chatApi