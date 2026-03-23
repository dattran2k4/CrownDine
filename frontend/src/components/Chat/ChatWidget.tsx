import { useState, useEffect, useRef } from 'react'
import { MessageSquare, X, Send, Minimize2, Bot, Sparkles } from 'lucide-react'
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
    // Match: /reservation?step=X&tableName=... or just reservation?step=X&... or any variation
    const reservationLinkRegex = /\/?reservation\?[^\s\n]*/gi
    // Also match partial links that might appear (like "T2-01&date=..." if AI cuts off the beginning)
    const partialLinkRegex = /(?:tableName|step|date|startTime|endTime|guests)=[^\s\n]*/gi
    
    let displayContent = content
    // Remove full reservation links
    displayContent = displayContent.replace(reservationLinkRegex, '')
    // Remove any remaining partial link patterns
    displayContent = displayContent.replace(partialLinkRegex, '')
    
    // Clean up multiple spaces BUT preserve line breaks
    // Replace multiple spaces (but not newlines) with single space
    displayContent = displayContent.replace(/[ \t]+/g, ' ')
    // CRITICAL: Remove line breaks between item name and price to keep them on same line
    // BUT: Keep price on separate line for combos (items starting with "Combo")
    // IMPORTANT: Process regular items first, preserve combo format
    // Pattern: Item name (not combo) followed by newline then "Giá:" -> merge to same line
    // Use negative lookahead to exclude items starting with "Combo"
    displayContent = displayContent.replace(/(\s+-\s+(?!Combo)[^\n]+)\n\s+Giá:/g, '$1 - Giá:')
    // Ensure combo price doesn't have "-" before "Giá:" (should be just "Giá:")
    // Remove any "-" that might appear before "Giá:" on a line with indent (combo format)
    displayContent = displayContent.replace(/(\s+)-\s+Giá:/g, '$1Giá:')
    // Ensure line breaks between combo items (after VNĐ and before next dash item)
    // This ensures combos are separated by line breaks
    displayContent = displayContent.replace(/([0-9.,]+\s*VNĐ[^\n]*)\n\s+(\s+-\s+)/g, '$1\n\n$2')
    // Clean up multiple consecutive line breaks (max 2)
    displayContent = displayContent.replace(/\n{3,}/g, '\n\n')
    // Trim each line but keep line breaks
    displayContent = displayContent.split('\n').map(line => line.trim()).join('\n').trim()
    
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
          // Improved regex to match reservation links even with spaces, line breaks, or partial links
          // Matches: /reservation?step=3&tableName=... or reservation?step=4&... or just step=3&tableName=...
          const reservationLinkRegex = /(?:^|\s)(\/?reservation\?step=\d+[^\s\n]*)/gi
          const content = msg.content.replace(/\s+/g, ' ') // Normalize whitespace
          let matches = content.match(reservationLinkRegex)
          
          // If no full link found, try to reconstruct from partial patterns
          if (!matches || matches.length === 0) {
            // Try to find step parameter and other params separately
            const stepMatch = content.match(/step=(\d+)/i)
            const tableNameMatch = content.match(/tableName=([^&\s\n]+)/i)
            const dateMatch = content.match(/date=([^&\s\n]+)/i)
            const startTimeMatch = content.match(/startTime=([^&\s\n]+)/i)
            const endTimeMatch = content.match(/endTime=([^&\s\n]+)/i)
            const guestsMatch = content.match(/guests=([^&\s\n]+)/i)
            
            if (stepMatch && tableNameMatch && dateMatch && startTimeMatch && endTimeMatch && guestsMatch) {
              // Reconstruct the link
              const reconstructedLink = `/reservation?step=${stepMatch[1]}&tableName=${tableNameMatch[1]}&date=${dateMatch[1]}&startTime=${startTimeMatch[1]}&endTime=${endTimeMatch[1]}&guests=${guestsMatch[1]}`
              matches = [reconstructedLink]
            }
          }
          
          // If still no link found, try to extract from conversation history when AI confirms reservation
          if ((!matches || matches.length === 0) && updatedConversation.messages.length > 0) {
            // Check if this is a confirmation message (contains keywords like "chuyển", "đặt món", "thanh toán")
            const isConfirmation = /(chuyển|đặt món|thanh toán|đặt cọc|bước 3|bước 4|tuyệt vời.*chuyển)/i.test(content)
            const mentionsStep3 = /(đặt món|chọn món|bước 3)/i.test(content)
            const mentionsStep4 = /(thanh toán|đặt cọc|bước 4)/i.test(content)
            
            if (isConfirmation) {
              // Extract information from conversation history
              const allMessages = updatedConversation.messages
                .filter(m => m.role !== 'system')
                .map(m => m.content)
                .join(' ')
              
              // Extract table name (look for "Bàn" followed by name, handle various formats)
              // Priority: Full format > Partial format > Number only
              const tableNamePatterns = [
                /(?:Bàn|bàn)\s+([A-Z]\d+-\d+)/i,  // "Bàn T2-01" (highest priority - most specific)
                /(?:Bàn|bàn)\s+(\d{2,})/i,  // "Bàn 01", "Bàn 10" (2+ digits)
                /(?:Bàn|bàn)\s+(\d{1})/i,  // "Bàn 1", "Bàn 2" (single digit)
                /([A-Z]\d+-\d+)/i,  // "T2-01" (without "Bàn")
                /(?:Bàn|bàn)\s+([A-Z0-9\-]+(?:\s+[A-Z0-9\-]+)?)/i,  // "Bàn T2 01" (with space)
                /([A-Z]\d+)/i  // "T2" (fallback)
              ]
              
              let extractedTableName = ''
              for (const pattern of tableNamePatterns) {
                const match = allMessages.match(pattern)
                if (match && match[1]) {
                  extractedTableName = match[1].trim()
                  
                  // Normalize table name format
                  // If it's just a number (1-99), add "Bàn " prefix and pad with 0 if needed
                  if (/^\d{1,2}$/.test(extractedTableName)) {
                    const num = parseInt(extractedTableName)
                    extractedTableName = `Bàn ${String(num).padStart(2, '0')}`
                  } 
                  // If it's format like "T2-01" or "T2", keep as is (these are valid table names)
                  else if (/^[A-Z]\d+(-\d+)?$/.test(extractedTableName)) {
                    // Keep as is - these are valid table identifiers
                  }
                  // If it doesn't start with "Bàn" and is not a table code, add "Bàn " prefix
                  else if (!/^Bàn/i.test(extractedTableName) && !/^[A-Z]\d+/.test(extractedTableName)) {
                    extractedTableName = `Bàn ${extractedTableName}`
                  }
                  
                  console.log('Extracted table name:', extractedTableName)
                  break
                }
              }
              
              // If still no table name found, try to find from AI's confirmation message
              if (!extractedTableName) {
                // Look for table name in the current assistant message (most recent)
                const currentMessagePatterns = [
                  /(?:bàn|Bàn)\s+([A-Z]\d+-\d+)/i,
                  /(?:bàn|Bàn)\s+(\d{2,})/i,
                  /([A-Z]\d+-\d+)/i
                ]
                for (const pattern of currentMessagePatterns) {
                  const match = content.match(pattern)
                  if (match && match[1]) {
                    extractedTableName = match[1].trim()
                    if (/^\d+$/.test(extractedTableName)) {
                      extractedTableName = `Bàn ${String(parseInt(extractedTableName)).padStart(2, '0')}`
                    }
                    break
                  }
                }
              }
              
              // Extract date (look for date patterns)
              const datePatterns = [
                /(\d{4}-\d{2}-\d{2})/,  // YYYY-MM-DD
                /(\d{1,2}\/\d{1,2}\/\d{4})/,  // DD/MM/YYYY
                /(?:ngày|ngay)\s+(\d{1,2})/,  // "ngày 17"
                /(?:mai|hôm nay|hôm nay)/i  // "mai" or "hôm nay"
              ]
              
              let extractedDate = ''
              for (const pattern of datePatterns) {
                const match = allMessages.match(pattern)
                if (match) {
                  if (match[1] && /^\d{4}-\d{2}-\d{2}$/.test(match[1])) {
                    extractedDate = match[1]
                  } else if (match[1] && match[1].includes('/')) {
                    // DD/MM/YYYY format - convert to YYYY-MM-DD
                    const parts = match[1].split('/')
                    if (parts.length === 3) {
                      extractedDate = `${parts[2]}-${parts[1].padStart(2, '0')}-${parts[0].padStart(2, '0')}`
                    }
                  } else if (match[1] && /^\d+$/.test(match[1])) {
                    // "ngày DD" - use current year and month
                    const today = new Date()
                    const day = parseInt(match[1])
                    extractedDate = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
                  } else if (match[0]) {
                    // "mai" or "hôm nay"
                    const today = new Date()
                    if (match[0].toLowerCase().includes('mai')) {
                      today.setDate(today.getDate() + 1)
                    }
                    extractedDate = today.toISOString().split('T')[0]
                  }
                  if (extractedDate) break
                }
              }
              
              // If no date found, use tomorrow as default
              if (!extractedDate) {
                const tomorrow = new Date()
                tomorrow.setDate(tomorrow.getDate() + 1)
                extractedDate = tomorrow.toISOString().split('T')[0]
              }
              
              // Validate: KHÔNG được đặt bàn vào ngày trong quá khứ
              const now = new Date()
              const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
              const selectedDate = new Date(extractedDate)
              const selectedDateOnly = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), selectedDate.getDate())
              
              if (selectedDateOnly < today) {
                // Nếu ngày trong quá khứ, từ chối và không tạo link
                console.log('Selected date is in the past, rejecting reservation:', extractedDate)
                // Không tạo link, chỉ return để không navigate
                return
              }
              
              // Extract start time (look for time patterns like "11:00", "11h", "11 giờ")
              const timePatterns = [
                /(\d{1,2}):(\d{2})/,  // "11:00"
                /(\d{1,2})h(?:\s*(\d{2}))?/,  // "11h" or "11h30"
                /(\d{1,2})\s+giờ/,  // "11 giờ"
                /(?:lúc|vào)\s+(\d{1,2})(?::(\d{2}))?/i  // "lúc 11" or "lúc 11:00"
              ]
              
              const RESTAURANT_OPEN_HOUR = 9
              const RESTAURANT_CLOSE_HOUR = 22
              
              let extractedStartTime = ''
              for (const pattern of timePatterns) {
                const match = allMessages.match(pattern)
                if (match) {
                  const hours = parseInt(match[1] || '0')
                  const minutes = parseInt(match[2] || '0')
                  
                  // CHỈ chấp nhận giờ trong khoảng mở cửa (10:00 - 21:59)
                  if (hours >= RESTAURANT_OPEN_HOUR && hours < RESTAURANT_CLOSE_HOUR) {
                    extractedStartTime = `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`
                    break
                  } else if (hours < RESTAURANT_OPEN_HOUR) {
                    // Nếu trước giờ mở cửa, điều chỉnh về giờ mở cửa
                    extractedStartTime = `${String(RESTAURANT_OPEN_HOUR).padStart(2, '0')}:00`
                    console.log(`Time ${hours}:${minutes} is before opening hour, adjusted to ${RESTAURANT_OPEN_HOUR}:00`)
                    break
                  } else if (hours >= RESTAURANT_CLOSE_HOUR) {
                    // Nếu sau hoặc bằng giờ đóng cửa, không chấp nhận - sẽ dùng default
                    console.log(`Time ${hours}:${minutes} is at or after closing hour, will use default time`)
                    break
                  }
                }
              }
              
              // Extract duration (thời lượng đặt bàn: 1 tiếng, 2 tiếng, 3 tiếng, ...)
              const durationPatterns = [
                /(\d+)\s*(?:tiếng|giờ|h)/i,  // "1 tiếng", "2 giờ", "3h"
                /đặt\s+(\d+)\s*(?:tiếng|giờ)/i,  // "đặt 2 tiếng"
                /(\d+)\s*(?:tiếng|giờ)\s+đặt/i,  // "2 tiếng đặt"
                /(\d+)\s*(?:tiếng|giờ)\s+bàn/i,  // "2 tiếng bàn"
                /bàn\s+(\d+)\s*(?:tiếng|giờ)/i  // "bàn 2 tiếng"
              ]
              
              let durationHours = 2 // Default 2 hours
              for (const pattern of durationPatterns) {
                const match = allMessages.match(pattern)
                if (match && match[1]) {
                  const hours = parseInt(match[1])
                  if (hours >= 1 && hours <= 12) { // Reasonable range: 1-12 hours
                    durationHours = hours
                    break
                  }
                }
              }
              
              // Calculate end time based on start time + duration
              let extractedEndTime = ''
              if (extractedStartTime) {
                const [startHours, startMinutes] = extractedStartTime.split(':').map(Number)
                const startDate = new Date()
                startDate.setHours(startHours, startMinutes, 0, 0)
                startDate.setHours(startDate.getHours() + durationHours)
                
                const calculatedEndHours = startDate.getHours()
                const calculatedEndMinutes = startDate.getMinutes()
                
                // Validate: endTime không được vượt quá giờ đóng cửa (22:00)
                if (calculatedEndHours > RESTAURANT_CLOSE_HOUR || (calculatedEndHours === RESTAURANT_CLOSE_HOUR && calculatedEndMinutes > 0)) {
                  // Nếu vượt quá, điều chỉnh về 22:00
                  extractedEndTime = `${String(RESTAURANT_CLOSE_HOUR).padStart(2, '0')}:00`
                  console.log(`Calculated end time ${calculatedEndHours}:${calculatedEndMinutes} exceeds closing hour, adjusted to ${RESTAURANT_CLOSE_HOUR}:00`)
                } else {
                  extractedEndTime = `${String(calculatedEndHours).padStart(2, '0')}:${String(calculatedEndMinutes).padStart(2, '0')}`
                }
              } else {
                // If no time found, use default 18:00-20:00 (trong giờ mở cửa)
                extractedStartTime = '18:00'
                const defaultEndDate = new Date()
                defaultEndDate.setHours(18, 0, 0, 0)
                defaultEndDate.setHours(defaultEndDate.getHours() + durationHours)
                const defaultEndHours = defaultEndDate.getHours()
                const defaultEndMinutes = defaultEndDate.getMinutes()
                
                // Ensure default end time doesn't exceed closing hour
                if (defaultEndHours > RESTAURANT_CLOSE_HOUR || (defaultEndHours === RESTAURANT_CLOSE_HOUR && defaultEndMinutes > 0)) {
                  extractedEndTime = `${String(RESTAURANT_CLOSE_HOUR).padStart(2, '0')}:00`
                } else {
                  extractedEndTime = `${String(defaultEndHours).padStart(2, '0')}:${String(defaultEndMinutes).padStart(2, '0')}`
                }
              }
              
              // Validate: không được đặt giờ trong quá khứ và phải trong giờ mở cửa (10:00 - 22:00)
              if (extractedDate && extractedStartTime && extractedEndTime) {
                const selectedStartDateTime = new Date(`${extractedDate}T${extractedStartTime}`)
                const now = new Date()
                
                // Check if time is in past
                if (selectedStartDateTime < now) {
                  // If time is in past, use tomorrow with same time
                  const tomorrow = new Date()
                  tomorrow.setDate(tomorrow.getDate() + 1)
                  extractedDate = tomorrow.toISOString().split('T')[0]
                  console.log('Time was in past, adjusted to tomorrow:', extractedDate)
                }
                
                // Final validation: đảm bảo startTime và endTime đều trong giờ mở cửa
                const startHours = parseInt(extractedStartTime.split(':')[0])
                const endHours = parseInt(extractedEndTime.split(':')[0])
                const endMinutes = parseInt(extractedEndTime.split(':')[1] || '0')
                
                // Validate startTime: phải >= 09:00 và < 22:00
                if (startHours < RESTAURANT_OPEN_HOUR || startHours >= RESTAURANT_CLOSE_HOUR) {
                  console.log(`Start time ${extractedStartTime} is outside opening hours, adjusting to ${RESTAURANT_OPEN_HOUR}:00`)
                  extractedStartTime = `${String(RESTAURANT_OPEN_HOUR).padStart(2, '0')}:00`
                  // Recalculate endTime
                  const recalcEndDate = new Date()
                  recalcEndDate.setHours(RESTAURANT_OPEN_HOUR, 0, 0, 0)
                  recalcEndDate.setHours(recalcEndDate.getHours() + durationHours)
                  const recalcEndHours = recalcEndDate.getHours()
                  const recalcEndMinutes = recalcEndDate.getMinutes()
                  
                  if (recalcEndHours > RESTAURANT_CLOSE_HOUR || (recalcEndHours === RESTAURANT_CLOSE_HOUR && recalcEndMinutes > 0)) {
                    extractedEndTime = `${String(RESTAURANT_CLOSE_HOUR).padStart(2, '0')}:00`
                  } else {
                    extractedEndTime = `${String(recalcEndHours).padStart(2, '0')}:${String(recalcEndMinutes).padStart(2, '0')}`
                  }
                }
                
                // Validate endTime: phải <= 22:00
                if (endHours > RESTAURANT_CLOSE_HOUR || (endHours === RESTAURANT_CLOSE_HOUR && endMinutes > 0)) {
                  console.log(`End time ${extractedEndTime} exceeds closing hour, adjusting to ${RESTAURANT_CLOSE_HOUR}:00`)
                  extractedEndTime = `${String(RESTAURANT_CLOSE_HOUR).padStart(2, '0')}:00`
                  
                  // Recalculate startTime backwards (endTime - duration)
                  const recalcStartDate = new Date()
                  recalcStartDate.setHours(RESTAURANT_CLOSE_HOUR, 0, 0, 0)
                  recalcStartDate.setHours(recalcStartDate.getHours() - durationHours)
                  const recalcStartHours = recalcStartDate.getHours()
                  const recalcStartMinutes = recalcStartDate.getMinutes()
                  
                  // Ensure recalculated startTime is not before opening hour
                  if (recalcStartHours < RESTAURANT_OPEN_HOUR) {
                    extractedStartTime = `${String(RESTAURANT_OPEN_HOUR).padStart(2, '0')}:00`
                    // Recalculate endTime again
                    const finalEndDate = new Date()
                    finalEndDate.setHours(RESTAURANT_OPEN_HOUR, 0, 0, 0)
                    finalEndDate.setHours(finalEndDate.getHours() + durationHours)
                    const finalEndHours = finalEndDate.getHours()
                    const finalEndMinutes = finalEndDate.getMinutes()
                    
                    if (finalEndHours > RESTAURANT_CLOSE_HOUR || (finalEndHours === RESTAURANT_CLOSE_HOUR && finalEndMinutes > 0)) {
                      extractedEndTime = `${String(RESTAURANT_CLOSE_HOUR).padStart(2, '0')}:00`
                    } else {
                      extractedEndTime = `${String(finalEndHours).padStart(2, '0')}:${String(finalEndMinutes).padStart(2, '0')}`
                    }
                  } else {
                    extractedStartTime = `${String(recalcStartHours).padStart(2, '0')}:${String(recalcStartMinutes).padStart(2, '0')}`
                  }
                }
                
                // Final check: đảm bảo cả startTime và endTime đều hợp lệ
                const finalStartHours = parseInt(extractedStartTime.split(':')[0])
                const finalEndHours = parseInt(extractedEndTime.split(':')[0])
                const finalEndMinutes = parseInt(extractedEndTime.split(':')[1] || '0')
                
                if (finalStartHours < RESTAURANT_OPEN_HOUR || finalStartHours >= RESTAURANT_CLOSE_HOUR) {
                  console.log('Final validation failed for startTime, using default')
                  extractedStartTime = '18:00'
                  extractedEndTime = '20:00'
                }
                
                if (finalEndHours > RESTAURANT_CLOSE_HOUR || (finalEndHours === RESTAURANT_CLOSE_HOUR && finalEndMinutes > 0)) {
                  console.log('Final validation failed for endTime, capping to closing hour')
                  extractedEndTime = `${String(RESTAURANT_CLOSE_HOUR).padStart(2, '0')}:00`
                }
              }
              
              // Extract guests (look for number + "người" or "khách")
              const guestsPattern = /(\d+)\s*(?:người|khách)/i
              const guestsMatch = allMessages.match(guestsPattern)
              const extractedGuests = guestsMatch ? guestsMatch[1] : '2' // Default to 2
              
              // Determine step (3 for food menu, 4 for payment)
              const step = mentionsStep4 ? '4' : mentionsStep3 ? '3' : '3' // Default to step 3
              
              // Try to construct link if we have enough information
              if (extractedTableName && extractedDate && extractedStartTime && extractedEndTime) {
                const autoLink = `/reservation?step=${step}&tableName=${encodeURIComponent(extractedTableName)}&date=${extractedDate}&startTime=${extractedStartTime}&endTime=${extractedEndTime}&guests=${extractedGuests}`
                matches = [autoLink]
                console.log(' Auto-extracted reservation info from conversation:', {
                  tableName: extractedTableName,
                  date: extractedDate,
                  startTime: extractedStartTime,
                  endTime: extractedEndTime,
                  guests: extractedGuests,
                  step: step,
                  link: autoLink
                })
              } else {
                console.warn('⚠️ Missing information for auto-navigation:', {
                  hasTableName: !!extractedTableName,
                  hasDate: !!extractedDate,
                  hasStartTime: !!extractedStartTime,
                  hasEndTime: !!extractedEndTime,
                  extractedTableName,
                  extractedDate,
                  extractedStartTime,
                  extractedEndTime
                })
              }
            }
          }
          
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
        <Button
          onClick={handleToggle}
          className="group h-16 w-16 rounded-full bg-gradient-to-br from-blue-600 via-blue-500 to-indigo-600 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-110 flex items-center justify-center relative overflow-hidden"
          size="icon"
          title="Chat với CrownDine"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          <MessageSquare className="h-7 w-7 text-white relative z-10 group-hover:scale-110 transition-transform duration-200" />
          <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-emerald-400 ring-2 ring-white animate-pulse" />
        </Button>
      </div>
    )
  }

  return (
    <div
      className={`fixed bottom-6 right-6 z-50 transition-all duration-500 ease-out ${
        isMinimized ? 'h-[72px]' : 'h-[640px]'
      } w-[400px] md:w-[440px] animate-in fade-in slide-in-from-bottom-4`}
    >
      <div className="relative flex h-full flex-col rounded-2xl bg-white shadow-[0_20px_50px_rgba(0,0,0,0.15)] border border-slate-100 overflow-hidden backdrop-blur-sm">
        {/* Header */}
        <div className="relative flex items-center justify-between bg-gradient-to-br from-blue-600 via-blue-500 to-indigo-600 px-5 py-4 flex-shrink-0 z-10">
          <div className="flex items-center gap-3">
            <div className="relative flex h-11 w-11 items-center justify-center rounded-full bg-white/20 ring-2 ring-white/30 backdrop-blur-sm shadow-lg">
              <Bot className="h-6 w-6 text-white" />
              <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full bg-emerald-400 ring-2 ring-white shadow-sm" />
            </div>
            <div className="flex flex-col">
              <h3 className="text-[15px] font-bold text-white tracking-tight">CrownDine AI</h3>
              <div className="flex items-center gap-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-[11px] font-medium text-blue-50/90">Sẵn sàng hỗ trợ</span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-1">
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
              className="flex-1 bg-gradient-to-b from-slate-50/50 via-white to-slate-50/30 px-4 py-5 overflow-y-auto overflow-x-hidden scrollbar-thin scrollbar-thumb-slate-300 scrollbar-track-transparent"
              style={{ minHeight: 0 }}
            >
              <div className="mx-auto flex min-h-full max-w-full flex-col space-y-3.5">
                {/* Welcome message when no messages */}
                {currentConversation && currentConversation.messages.filter((m) => m.role !== 'system').length === 0 && (
                  <div className="flex justify-start animate-in fade-in slide-in-from-bottom-2 duration-300">
                    <div className="rounded-2xl rounded-tl-sm bg-white px-5 py-4 shadow-md ring-1 ring-slate-200/50 max-w-[88%]">
                      <div className="flex items-center gap-2 mb-2">
                        <Sparkles className="h-4 w-4 text-blue-500" />
                        <p className="text-[14px] leading-relaxed text-slate-800 font-semibold">
                          Xin chào! Mình là trợ lý AI của CrownDine
                        </p>
                      </div>
                      <p className="text-[13px] leading-relaxed text-slate-700 mt-2">
                        Mình có thể giúp bạn đặt bàn, gợi ý món ăn và hỗ trợ thanh toán cọc.
                      </p>
                      <p className="text-slate-500 text-[12px] mt-3 pt-3 border-t border-slate-100">
                        💡 Bạn có thể hỏi về đặt bàn, menu, hoặc dịch vụ nhà hàng!
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
                          className={`max-w-[85%] rounded-2xl px-4 py-3 text-[14px] leading-relaxed shadow-md transition-all duration-200 ${
                            msg.role === 'user'
                              ? 'rounded-br-sm bg-gradient-to-br from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-500/25 hover:shadow-xl hover:shadow-blue-500/30'
                              : 'rounded-bl-sm bg-white text-slate-800 ring-1 ring-slate-200/60 hover:ring-slate-300/60'
                          }`}
                        >
                          <p className="whitespace-pre-wrap break-words font-normal">{renderMessageContent(msg.content)}</p>
                          <p
                            className={`mt-2 text-[11px] font-medium ${
                              msg.role === 'user' ? 'text-blue-100/80' : 'text-slate-400'
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
                  <div className="flex h-full items-center justify-center">
                    <div className="text-center text-slate-500">
                      <div className="mx-auto mb-3 h-12 w-12 rounded-full bg-slate-100 flex items-center justify-center animate-pulse">
                        <MessageSquare className="h-6 w-6 text-slate-400" />
                      </div>
                      <p className="text-sm font-medium">Đang tải cuộc trò chuyện...</p>
                    </div>
                  </div>
                )}

                {isLoading && (
                  <div className="flex justify-start animate-in fade-in duration-200">
                    <div className="flex items-center gap-2.5 rounded-2xl rounded-bl-sm bg-white px-4 py-3 shadow-md ring-1 ring-slate-200/60">
                      <div className="flex space-x-1.5">
                        <div className="h-2 w-2 animate-bounce rounded-full bg-blue-500" />
                        <div
                          className="h-2 w-2 animate-bounce rounded-full bg-blue-500"
                          style={{ animationDelay: '0.15s' }}
                        />
                        <div
                          className="h-2 w-2 animate-bounce rounded-full bg-blue-500"
                          style={{ animationDelay: '0.3s' }}
                        />
                      </div>
                      <span className="text-[12px] text-slate-600 font-medium">Đang soạn trả lời...</span>
                    </div>
                  </div>
                )}

                <div ref={messagesEndRef} />
              </div>
            </div>

            {/* Input Area */}
            <div className="border-t border-slate-200/80 bg-white/98 px-4 py-4 backdrop-blur-sm">
              <div className="flex items-end gap-3">
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Nhập câu hỏi của bạn..."
                  className="flex-1 min-h-[56px] max-h-[120px] resize-none rounded-2xl border border-slate-200 bg-slate-50/80 px-4 py-3.5 text-[14px] leading-relaxed text-slate-900 placeholder:text-slate-400 shadow-sm outline-none transition-all duration-200 focus:border-blue-400 focus:bg-white focus:ring-2 focus:ring-blue-100 focus:shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                  rows={2}
                  disabled={isLoading || !currentConversation}
                />
                <Button
                  onClick={sendMessage}
                  disabled={!message.trim() || isLoading || !currentConversation}
                  className="flex h-[56px] min-w-[56px] items-center justify-center rounded-2xl bg-gradient-to-br from-blue-600 via-blue-500 to-indigo-600 px-5 text-sm font-semibold text-white shadow-lg transition-all duration-200 hover:from-blue-700 hover:via-blue-600 hover:to-indigo-700 hover:shadow-xl hover:scale-105 active:scale-95 disabled:cursor-not-allowed disabled:from-slate-300 disabled:via-slate-300 disabled:to-slate-300 disabled:text-slate-100 disabled:hover:scale-100"
                  size="icon"
                >
                  <Send className="h-4.5 w-4.5" />
                </Button>
              </div>
              <p className="mt-2.5 text-[10px] text-slate-400 text-center font-medium">
                💬 Chatbot sẽ tự động chuyển bạn đến bước đặt món hoặc thanh toán sau khi xác nhận
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
