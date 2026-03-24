export interface ChatMessage {
  id: number
  role: 'user' | 'assistant' | 'system'
  content: string
  model?: string
  createdAt: string
}

export interface ChatConversation {
  id: number
  title: string
  createdAt: string
  updatedAt: string
  messages: ChatMessage[]
}

export interface ChatConversationRequest {
  title?: string
}

export interface ChatMessageRequest {
  conversationId: number
  content: string
}