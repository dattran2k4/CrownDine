package com.crowndine.repository;

import com.crowndine.model.Feedback;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface FeedbackRepository extends JpaRepository<Feedback, Long> {
    Optional<Feedback> findByUser_IdAndOrderDetail_Id(Long userId, Long orderDetailId);

    boolean existsByUser_IdAndOrder_IdAndOrderDetailIsNull(Long userId, Long orderId);
    boolean existsByUser_IdAndOrderDetail_Id(Long userId, Long orderDetailId);

    List<Feedback> findByItem_IdOrderByCreatedAtDesc(Long itemId);

    List<Feedback> findByCombo_IdOrderByCreatedAtDesc(Long comboId);

    @Query("SELECT AVG(f.rating) FROM Feedback f WHERE f.item.id = :itemId")
    Double getAverageRatingByItemId(Long itemId);

    @Query("SELECT AVG(f.rating) FROM Feedback f WHERE f.combo.id = :comboId")
    Double getAverageRatingByComboId(Long comboId);

    long countByItem_Id(Long itemId);

    long countByCombo_Id(Long comboId);
}
