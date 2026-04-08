package com.crowndine.core.repository;

import com.crowndine.core.entity.ChatConversation;
import com.crowndine.core.entity.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ChatConversationRepository extends JpaRepository<ChatConversation, Long> {

    List<ChatConversation> findByUserOrderByUpdatedAtDesc(User user);

    Page<ChatConversation> findByUserOrderByUpdatedAtDesc(User user, Pageable pageable);

    Optional<ChatConversation> findByIdAndUser(Long id, User user);

    void deleteByIdAndUser(Long id, User user);
}