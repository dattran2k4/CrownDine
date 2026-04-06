import { useState, useEffect, useRef } from 'react'
import { MessageSquare, X, Send, Minimize2, UtensilsCrossed, Sparkles } from 'lucide-react'
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
  const [isWaitingForResponse, setIsWaitingForResponse] = useState(false)
  const [processedLinks, setProcessedLinks] = useState<Set<string>>(new Set())
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const messagesContainerRef = useRef<HTMLDivElement>(null)
  const [isUserScrolling, setIsUserScrolling] = useState(false)
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated)
  const navigate = useNavigate()

  // Helper function to render message content - hide reservation links completely but preserve line breaks
  const renderMessageContent = (content: string) => {
    // Remove reservation links from display completely (they will be auto-detected and navigated)
    // Matches the entire link up to the guests parameter, even with spaces in tableName
    const reservationLinkRegex = /\/?reservation\?step=\d+.*?guests=\d+/gi

    let displayContent = content
    // Remove full reservation links
    displayContent = displayContent.replace(reservationLinkRegex, '')

    // Clean up multiple spaces BUT preserve line breaks
    // Replace multiple spaces (but not newlines) with single space
    displayContent = displayContent.replace(/[ \t]{2,}/g, ' ')
    
    // Clean up multiple consecutive line breaks (max 2)
    displayContent = displayContent.replace(/\n{3,}/g, '\n\n')
    
    // Trim string ends but keep internal formatting/indentation intact
    displayContent = displayContent.trim()

    // Since we're using whitespace-pre-wrap, we can return the string directly
    // But we need to handle URLs separately
    const urlRegex = /(https?:\/\/[^\s\n]+)/g
    const parts = displayContent.split(urlRegex)

    return parts.map((part, index) => {
      if (urlRegex.test(part)) {
        return (
          <a
            key={index}
        href={part}
        target="_blank"
        rel="noopener noreferrer"
        className="text-blue-600 hover:text-blue-800 underline font-medium"
          >
          {part}
          </a>
      )
      }
      // Return as string fragment - whitespace-pre-wrap will handle line breaks
      return <span key={index}>{part}</span>
    })
  }

  // Load conversations when widget opens
  useEffect(() => {
    if (isOpen && isAuthenticated) {
      loadConversations()
    }
  }, [isOpen, isAuthenticated])

  // Check if user is at bottom of chat
  const isAtBottom = () => {
    if (!messagesContainerRef.current) return true
    const container = messagesContainerRef.current
    const threshold = 100 // pixels from bottom
    return container.scrollHeight - container.scrollTop - container.clientHeight < threshold
  }

  // Handle scroll events to detect user scrolling
  useEffect(() => {
    const container = messagesContainerRef.current
    if (!container) return

    const handleScroll = () => {
      setIsUserScrolling(!isAtBottom())
    }

    container.addEventListener('scroll', handleScroll)
    return () => container.removeEventListener('scroll', handleScroll)
  }, [currentConversation])

  // Auto scroll to bottom only if user is at bottom (new messages)
  useEffect(() => {
    if (isOpen && !isMinimized && isAtBottom() && !isUserScrolling) {
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
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTo({
        top: messagesContainerRef.current.scrollHeight,
        behavior: 'smooth'
      })
    } else {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }
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

        // Auto-navigate if assistant message contains a reservation link OR confirmation message
        newAssistantMessages.forEach(msg => {
          // Improved regex to match reservation links even with spaces in tableName
          const reservationLinkRegex = /\/?reservation\?step=\d+.*?guests=\d+/gi
          let matches = msg.content.match(reservationLinkRegex)




          if (matches && matches.length > 0) {
            matches.forEach(link => {
              // Clean up the link (remove leading/trailing whitespace and punctuation)
              let cleanLink = link.trim().replace(/^\/?/, '/') // Ensure starts with /
              cleanLink = cleanLink.replace(/[.,!?;:]$/, '').trim()

              // Ensure it's a valid reservation link
              if (cleanLink.startsWith('/reservation?step=')) {
                // Check if we've already processed this link
                if (!processedLinks.has(cleanLink)) {
                  console.log(' Auto-navigating to reservation page:', cleanLink)
                  setProcessedLinks(prev => new Set([...prev, cleanLink]))

                  // Show toast notification
                  const stepNumber = cleanLink.includes('step=4') ? '4 (Thanh toán)' : '3 (Đặt món)'
                  toast.info('Đang chuyển đến trang đặt bàn...', {
                    description: `Chuyển đến bước ${stepNumber}`
                  })

                  // Auto-navigate after a short delay to show the message
                  setTimeout(() => {
                    navigate(cleanLink)
                    setIsOpen(false)
                    setIsMinimized(false)
                  }, 1500) // 1.5 second delay to let user see the message
                } else {
                  console.log('⏭️ Link already processed, skipping:', cleanLink)
                }
              } else {
                console.warn('⚠️ Invalid reservation link format:', cleanLink)
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
      <div className="fixed bottom-6 right-6 z-50 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="group h-16 w-16 rounded-full shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-110 flex items-center justify-center relative overflow-hidden border-0 cursor-pointer"
    style={{ background: 'linear-gradient(135deg, #ff6b35 0%, #e85520 50%, #c43e0e 100%)' }}
    onClick={handleToggle}
    title="Chat với CrownDine"
    >
    <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
    <UtensilsCrossed className="h-7 w-7 text-white relative z-10 group-hover:scale-110 transition-transform duration-200" />
    <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-green-400 ring-2 ring-white animate-pulse" />
      </div>
      </div>
  )
  }

  return (
    <div
      className={`fixed bottom-6 right-6 z-50 transition-all duration-500 ease-out ${
      isMinimized ? 'h-[72px]' : 'h-[640px]'
    } w-[400px] md:w-[440px] animate-in fade-in slide-in-from-bottom-4`}
>
  <div className="relative flex h-full flex-col rounded-2xl overflow-hidden" style={{ background: '#fff', boxShadow: '0 20px 60px rgba(0,0,0,0.18)', border: '1px solid #f0ede8' }}>
    {/* Header */}
    <div className="relative flex items-center justify-between px-5 py-4 flex-shrink-0 z-10" style={{ background: 'linear-gradient(135deg, #ff6b35 0%, #e85520 60%, #c43e0e 100%)' }}>
  {/* Decorative pattern */}
  <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle at 20% 50%, white 1px, transparent 1px), radial-gradient(circle at 80% 20%, white 1px, transparent 1px)', backgroundSize: '30px 30px' }} />
  <div className="flex items-center gap-3 relative z-10">
  <div className="relative flex h-11 w-11 items-center justify-center rounded-full bg-white/25 ring-2 ring-white/40 shadow-lg">
  <UtensilsCrossed className="h-5 w-5 text-white" />
  <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full bg-green-400 ring-2 ring-white shadow-sm" />
    </div>
    <div className="flex flex-col">
  <h3 className="text-[15px] font-bold text-white tracking-tight">CrownDine AI</h3>
  <div className="flex items-center gap-1.5">
  <span className="h-1.5 w-1.5 rounded-full bg-green-300 animate-pulse" />
  <span className="text-[11px] font-medium text-orange-50/90">Trợ lý đặt bàn thông minh</span>
  </div>
  </div>
  </div>
  <div className="flex items-center gap-1 relative z-10">
  <Button
    variant="ghost"
  size="icon"
  onClick={() => setIsMinimized(!isMinimized)}
  className="h-8 w-8 rounded-full text-white/90 hover:bg-white/20 hover:text-white transition-all duration-200"
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
  className="h-8 w-8 rounded-full text-white/90 hover:bg-white/20 hover:text-white transition-all duration-200"
  >
  <X className="h-4 w-4" />
    </Button>
    </div>
    </div>

  {!isMinimized && (
    <>
      {/* Messages */}
    <div
    ref={messagesContainerRef}
    className="flex-1 px-4 py-5 overflow-y-auto overflow-x-hidden scrollbar-thin scrollbar-thumb-orange-200 scrollbar-track-transparent"
    style={{ minHeight: 0, background: 'linear-gradient(180deg, #fdf8f4 0%, #ffffff 50%, #fdf8f4 100%)' }}
  >
    <div className="mx-auto flex min-h-full max-w-full flex-col space-y-3.5">
      {/* Welcome message when no messages */}
    {currentConversation && currentConversation.messages.filter((m) => m.role !== 'system').length === 0 && (
      <div className="flex justify-start animate-in fade-in slide-in-from-bottom-2 duration-300">
      <div className="rounded-2xl rounded-tl-sm bg-white px-5 py-4 max-w-[88%]" style={{ boxShadow: '0 2px 12px rgba(255,107,53,0.1)', border: '1px solid rgba(255,107,53,0.15)' }}>
      <div className="flex items-center gap-2 mb-2">
      <Sparkles className="h-4 w-4" style={{ color: '#ff6b35' }} />
      <p className="text-[14px] leading-relaxed font-semibold" style={{ color: '#2d1f14' }}>
        Xin chào! Mình là trợ lý AI của CrownDine
    </p>
    </div>
    <p className="text-[13px] leading-relaxed mt-2" style={{ color: '#5c4033' }}>
      Mình có thể giúp bạn đặt bàn, gợi ý món ăn và hỗ trợ thanh toán cọc.
    </p>
    <p className="text-[12px] mt-3 pt-3" style={{ color: '#9e7b6b', borderTop: '1px solid rgba(255,107,53,0.12)' }}>
      🍽️ Bạn có thể hỏi về đặt bàn, menu, hoặc dịch vụ nhà hàng!
    </p>
    </div>
    </div>
    )}

    {currentConversation ? (
        currentConversation.messages
          .filter((msg) => msg.role !== 'system')
          .map((msg, index) => (
            <div
              key={msg.id}
      className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-in fade-in slide-in-from-bottom-1 duration-200`}
      style={{ animationDelay: `${index * 50}ms` }}
    >
      <div
        className={`max-w-[85%] rounded-2xl px-4 py-3 text-[14px] leading-relaxed transition-all duration-200 ${
        msg.role === 'user'
          ? 'rounded-br-sm text-white'
          : 'rounded-bl-sm bg-white'
      }`}
      style={msg.role === 'user' ? {
        background: 'linear-gradient(135deg, #ff6b35, #c43e0e)',
        boxShadow: '0 4px 14px rgba(255,107,53,0.35)'
      } : {
        boxShadow: '0 2px 8px rgba(0,0,0,0.07)',
        border: '1px solid rgba(255,107,53,0.12)',
        color: '#2d1f14'
      }}
    >
      <p className="whitespace-pre-wrap break-words font-normal">{renderMessageContent(msg.content)}</p>
    <p
      className="mt-2 text-[11px] font-medium"
      style={{ color: msg.role === 'user' ? 'rgba(255,240,230,0.75)' : '#b09080' }}
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
      <div className="flex h-full items-center justify-center">
      <div className="text-center text-slate-500">
      <div className="mx-auto mb-3 h-12 w-12 rounded-full bg-slate-100 flex items-center justify-center animate-pulse">
      <MessageSquare className="h-6 w-6 text-slate-400" />
        </div>
        <p className="text-sm font-medium">Đang tải cuộc trò chuyện...</p>
    </div>
    </div>
    )}

    {(isLoading || isWaitingForResponse) && (
      <div className="flex justify-start animate-in fade-in duration-200">
      <div className="flex items-center gap-2.5 rounded-2xl rounded-bl-sm px-4 py-3 bg-white" style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.07)', border: '1px solid rgba(255,107,53,0.12)' }}>
      <div className="flex space-x-1.5">
      <div className="h-2 w-2 animate-bounce rounded-full" style={{ backgroundColor: '#ff6b35' }} />
      <div
        className="h-2 w-2 animate-bounce rounded-full"
        style={{ backgroundColor: '#ff6b35', animationDelay: '0.15s' }}
      />
      <div
        className="h-2 w-2 animate-bounce rounded-full"
        style={{ backgroundColor: '#ff6b35', animationDelay: '0.3s' }}
      />
      </div>
      <span className="text-[12px] font-medium" style={{ color: '#9e7b6b' }}>Đang soạn trả lời...</span>
    </div>
    </div>
    )}

    <div ref={messagesEndRef} />
  </div>
  </div>

    {/* Input Area */}
    <div className="px-4 py-4" style={{ borderTop: '1px solid rgba(255,107,53,0.15)', background: 'rgba(253,248,244,0.95)', backdropFilter: 'blur(8px)' }}>
    <div className="flex items-end gap-3">
    <textarea
      value={message}
    onChange={(e) => setMessage(e.target.value)}
    onKeyPress={handleKeyPress}
    placeholder="Nhập câu hỏi của bạn..."
    className="flex-1 min-h-[56px] max-h-[120px] resize-none rounded-2xl px-4 py-3.5 text-[14px] leading-relaxed outline-none transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
    style={{
      border: '1.5px solid rgba(255,107,53,0.25)',
      background: 'white',
      color: '#2d1f14'
    }}
    onFocus={(e) => { e.currentTarget.style.borderColor = '#ff6b35'; e.currentTarget.style.boxShadow = '0 0 0 3px rgba(255,107,53,0.12)' }}
    onBlur={(e) => { e.currentTarget.style.borderColor = 'rgba(255,107,53,0.25)'; e.currentTarget.style.boxShadow = 'none' }}
    rows={2}
    disabled={isLoading || !currentConversation}
    />
    <Button
    onClick={sendMessage}
    disabled={!message.trim() || isLoading || !currentConversation}
    className="flex h-[56px] min-w-[56px] items-center justify-center rounded-2xl px-5 text-sm font-semibold text-white transition-all duration-200 hover:scale-105 active:scale-95 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:scale-100 border-0"
    style={{ background: 'linear-gradient(135deg, #ff6b35, #c43e0e)', boxShadow: '0 4px 14px rgba(255,107,53,0.4)' }}
    size="icon"
    >
    <Send className="h-4.5 w-4.5" />
      </Button>
      </div>
      <p className="mt-2.5 text-[10px] text-center font-medium" style={{ color: '#b09080' }}>
      🍽️ Chatbot sẽ tự động chuyển bạn đến trang đặt món hoặc thanh toán
  </p>
  </div>
  </>
  )}
  </div>
  </div>
)
}
