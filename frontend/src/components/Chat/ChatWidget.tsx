import { useState, useEffect, useRef } from 'react'
import { MessageSquare, X, Send, Minimize2 } from 'lucide-react'
import chatApi from '@/apis/chat.api'
import type { ChatConversation, ChatMessage, ChatMessageRequest } from '@/types/chat.type'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import { useAuthStore } from '@/stores/useAuthStore'
import { useNavigate } from 'react-router-dom'

export default function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false)
  const [isMinimized, setIsMinimized] = useState(false)
  const [conversations, setConversations] = useState<ChatConversation[]>([])
  const [currentConversation, setCurrentConversation] = useState<ChatConversation | null>(null)
  const [message, setMessage] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isCreatingConversation, setIsCreatingConversation] = useState(false)
  const [isWaitingForResponse, setIsWaitingForResponse] = useState(false)
  const [processedLinks, setProcessedLinks] = useState<Set<string>>(new Set())
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated)
  const navigate = useNavigate()

  // Helper function to render message content - hide reservation links
  const renderMessageContent = (content: string) => {
    // Remove reservation links from display (they will be auto-detected and navigated)
    const reservationLinkRegex = /\/reservation\?[^\s\n]+/g
    const displayContent = content.replace(reservationLinkRegex, '').trim()
    
    // Detect other URLs (http/https) - still show these
    const urlRegex = /(https?:\/\/[^\s]+)/g
    const parts = displayContent.split(urlRegex)
    
    return parts.map((part, index) => {
      if (urlRegex.test(part)) {
        return (
          <span key={index}>
            <a
              href={part}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:text-blue-800 underline font-medium"
            >
              {part}
            </a>
          </span>
        )
      }
      return <span key={index}>{part}</span>
    })
  }

  // Load conversations when widget opens
  useEffect(() => {
    if (isOpen && isAuthenticated) {
      loadConversations()
    }
  }, [isOpen, isAuthenticated])

  // Auto scroll to bottom when new messages arrive
  useEffect(() => {
    if (isOpen && !isMinimized) {
      scrollToBottom()
    }
  }, [currentConversation?.messages, isOpen, isMinimized])

  // Poll for new messages when conversation is active
  useEffect(() => {
    if (currentConversation && isOpen && !isMinimized) {
      const interval = setInterval(() => {
        loadConversation(currentConversation.id)
      }, isWaitingForResponse ? 1000 : 2000) // Poll faster when waiting for response
      return () => clearInterval(interval)
    }
  }, [currentConversation, isOpen, isMinimized, isWaitingForResponse])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const loadConversations = async () => {
    try {
      const response = await chatApi.listConversations()
      if (response.data.data) {
        setConversations(response.data.data)
        // Auto-select first conversation or create new one
        if (response.data.data.length > 0) {
          loadConversation(response.data.data[0].id)
        } else {
          createConversation()
        }
      }
    } catch (error) {
      console.error('Failed to load conversations:', error)
    }
  }

  const loadConversation = async (conversationId: number): Promise<ChatConversation | null> => {
    try {
      const response = await chatApi.getConversation(conversationId)
      if (response.data.data) {
        const updatedConversation = response.data.data
        setCurrentConversation(updatedConversation)
        
        // Check if we got a new assistant response (created in last 10 seconds)
        const now = Date.now()
        const newAssistantMessages = updatedConversation.messages.filter(
          msg => msg.role === 'assistant' && 
                 (now - new Date(msg.createdAt).getTime()) < 10000
        )
        
        // If we were waiting and now have assistant message, stop aggressive polling
        if (isWaitingForResponse && newAssistantMessages.length > 0) {
          setIsWaitingForResponse(false)
        }

        // Auto-navigate if assistant message contains a reservation link
        newAssistantMessages.forEach(msg => {
          // Improved regex to match reservation links even with spaces or line breaks
          // Matches: /reservation?step=3&tableName=... or /reservation?step=4&tableName=...
          const reservationLinkRegex = /\/reservation\?step=\d+[^\s\n]*/g
          const content = msg.content.replace(/\s+/g, ' ') // Normalize whitespace
          const matches = content.match(reservationLinkRegex)
          
          if (matches && matches.length > 0) {
            matches.forEach(link => {
              // Clean up the link (remove trailing punctuation if any)
              const cleanLink = link.replace(/[.,!?;:]$/, '').trim()
              
              // Check if we've already processed this link
              if (!processedLinks.has(cleanLink)) {
                console.log('Auto-navigating to:', cleanLink)
                setProcessedLinks(prev => new Set([...prev, cleanLink]))
                
                // Auto-navigate after a short delay to show the message
                setTimeout(() => {
                  navigate(cleanLink)
                  setIsOpen(false)
                  setIsMinimized(false)
                }, 1500) // 1.5 second delay to let user see the message
              }
            })
          }
        })
        
        return updatedConversation
      }
      return null
    } catch (error) {
      console.error('Failed to load conversation:', error)
      return null
    }
  }

  const createConversation = async () => {
    setIsCreatingConversation(true)
    try {
      const response = await chatApi.createConversation({})
      if (response.data.data) {
        const newConv = response.data.data
        setConversations([newConv, ...conversations])
        setCurrentConversation(newConv)
      }
    } catch (error) {
      toast.error('Không thể tạo cuộc trò chuyện mới')
      console.error('Failed to create conversation:', error)
    } finally {
      setIsCreatingConversation(false)
    }
  }

  const sendMessage = async () => {
    if (!message.trim() || !currentConversation || isLoading || !isAuthenticated) return

    const messageToSend = message.trim()
    setMessage('')
    setIsLoading(true)

    try {
      const request: ChatMessageRequest = {
        conversationId: currentConversation.id,
        content: messageToSend
      }

      const response = await chatApi.sendMessage(request)
      if (response.data.data) {
        // Add user message immediately
        const userMessage: ChatMessage = {
          id: response.data.data.id,
          role: 'user',
          content: messageToSend,
          createdAt: new Date().toISOString()
        }

        setCurrentConversation((prev) => {
          if (!prev) return null
          return {
            ...prev,
            messages: [...prev.messages, userMessage]
          }
        })

        // Start aggressive polling for assistant response
        setIsWaitingForResponse(true)
        
        // Poll for assistant response
        const pollForResponse = async () => {
          let attempts = 0
          const maxAttempts = 60 // Poll for up to 60 seconds
          
          const poll = async () => {
            if (attempts >= maxAttempts) {
              setIsWaitingForResponse(false)
              return
            }
            
            const updatedConv = await loadConversation(currentConversation.id)
            attempts++
            
            // Check if assistant message arrived
            if (updatedConv) {
              const now = Date.now()
              const hasNewAssistant = updatedConv.messages.some(
                msg => msg.role === 'assistant' && 
                       (now - new Date(msg.createdAt).getTime()) < 10000
              )
              if (hasNewAssistant) {
                setIsWaitingForResponse(false)
                return
              }
            }
            
            // Continue polling
            setTimeout(poll, 1000)
          }
          
          // Start polling after 1 second
          setTimeout(poll, 1000)
        }
        
        pollForResponse()
      }
    } catch (error) {
      toast.error('Không thể gửi tin nhắn')
      console.error('Failed to send message:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  const handleToggle = () => {
    if (!isAuthenticated) {
      toast.error('Vui lòng đăng nhập để sử dụng chatbot')
      return
    }
    if (isOpen) {
      setIsMinimized(!isMinimized)
    } else {
      setIsOpen(true)
      setIsMinimized(false)
      if (conversations.length === 0) {
        loadConversations()
      }
    }
  }

  // Don't show widget if not authenticated
  if (!isAuthenticated) {
    return null
  }

  if (!isOpen) {
    return (
      <div className="fixed bottom-6 right-6 z-50">
        <Button
          onClick={handleToggle}
          className="h-14 w-14 rounded-full bg-blue-600 hover:bg-blue-700 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110"
          size="icon"
          title="Chat với chúng tôi"
        >
          <MessageSquare className="h-6 w-6 text-white" />
        </Button>
      </div>
    )
  }

  return (
    <div
      className={`fixed bottom-6 right-6 z-50 transition-all duration-300 ${
        isMinimized ? 'h-16' : 'h-[600px]'
      } w-96`}
    >
      <div className="bg-white rounded-lg shadow-2xl border border-gray-200 flex flex-col h-full overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            <h3 className="font-semibold">CrownDine Chat</h3>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsMinimized(!isMinimized)}
              className="h-8 w-8 text-white hover:bg-white/20"
            >
              <Minimize2 className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => {
                setIsOpen(false)
                setIsMinimized(false)
              }}
              className="h-8 w-8 text-white hover:bg-white/20"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {!isMinimized && (
          <>
            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
              {currentConversation ? (
                currentConversation.messages
                  .filter((msg) => msg.role !== 'system')
                  .map((msg) => (
                    <div
                      key={msg.id}
                      className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-[80%] rounded-lg p-3 ${
                          msg.role === 'user'
                            ? 'bg-blue-600 text-white'
                            : 'bg-white border border-gray-200 text-gray-800'
                        }`}
                      >
                        <p className="whitespace-pre-wrap break-words text-sm">{renderMessageContent(msg.content)}</p>
                        <p
                          className={`text-xs mt-1 ${
                            msg.role === 'user' ? 'text-blue-100' : 'text-gray-400'
                          }`}
                        >
                          {new Date(msg.createdAt).toLocaleTimeString('vi-VN', {
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </p>
                      </div>
                    </div>
                  ))
              ) : (
                <div className="flex items-center justify-center h-full">
                  <div className="text-center text-gray-500">
                    <MessageSquare className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                    <p className="text-sm">Đang tải...</p>
                  </div>
                </div>
              )}
              {isLoading && (
                <div className="flex justify-start">
                  <div className="bg-white border border-gray-200 rounded-lg p-3">
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
                      <div
                        className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                        style={{ animationDelay: '0.1s' }}
                      />
                      <div
                        className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                        style={{ animationDelay: '0.2s' }}
                      />
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="bg-white border-t border-gray-200 p-3">
              <div className="flex items-end gap-2">
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Nhập tin nhắn của bạn..."
                  className="flex-1 min-h-[50px] max-h-[100px] p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none text-sm"
                  rows={2}
                  disabled={isLoading || !currentConversation}
                />
                <Button
                  onClick={sendMessage}
                  disabled={!message.trim() || isLoading || !currentConversation}
                  className="bg-blue-600 hover:bg-blue-700 h-[50px] px-4"
                  size="icon"
                >
                  <Send className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
