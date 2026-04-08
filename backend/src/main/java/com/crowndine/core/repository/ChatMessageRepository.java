package com.crowndine.core.repository;

import com.crowndine.core.entity.ChatMessage;
import com.crowndine.core.entity.ChatConversation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ChatMessageRepository extends JpaRepository<ChatMessage, Long> {
    
    List<ChatMessage> findByConversationOrderByCreatedAtAsc(ChatConversation conversation);
    
    @Query(value = "SELECT m FROM ChatMessage m WHERE m.conversation = :conversation ORDER BY m.createdAt DESC")
    List<ChatMessage> findLastMessagesByConversation(@Param("conversation") ChatConversation conversation, org.springframework.data.domain.Pageable pageable);
    
    @Query(value = "SELECT m FROM ChatMessage m WHERE m.conversation.id = :conversationId ORDER BY m.createdAt DESC")
    List<ChatMessage> findLastMessagesByConversationId(@Param("conversationId") Long conversationId, org.springframework.data.domain.Pageable pageable);
}