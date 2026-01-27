package com.crowndine.repository;

import com.crowndine.model.Feedback;
import com.crowndine.model.Item;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface FeedbackRepository extends JpaRepository<Feedback, Long> {
    List<Feedback> findByItem(Item item);
}
