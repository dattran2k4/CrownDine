package com.crowndine.repository;

import com.crowndine.model.PointHistory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

@Repository
public interface PointHistoryRepository extends JpaRepository<PointHistory, Long> {
    Page<PointHistory> findByUserId(Long userId, Pageable pageable);
}
