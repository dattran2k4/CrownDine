package com.crowndine.repository;

import com.crowndine.model.Feedback;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface FeedbackRepository extends JpaRepository<Feedback, Long> {
    Optional<Feedback> findByUser_IdAndOrderDetail_Id(Long userId, Long orderDetailId);
    List<Feedback> findByItem_IdOrderByCreatedAtDesc(Long itemId);
    List<Feedback> findByCombo_IdOrderByCreatedAtDesc(Long comboId);

}
