package com.crowndine.core.repository;

import com.crowndine.core.entity.Notification;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface NotificationRepository extends JpaRepository<Notification, Long> {
    Page<Notification> findByUserUsernameOrderByCreatedAtDesc(String username, Pageable pageable);

    long countByUserUsernameAndReadAtIsNull(String username);

    Optional<Notification> findByIdAndUserUsername(Long id, String username);
}
