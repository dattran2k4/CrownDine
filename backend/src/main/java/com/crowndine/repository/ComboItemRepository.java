package com.crowndine.repository;

import org.springframework.stereotype.Repository;
import org.springframework.data.jpa.repository.JpaRepository;
import com.crowndine.model.ComboItem;


@Repository
public interface ComboItemRepository extends JpaRepository<ComboItem, Long> {
    void deleteByItemId(Long itemId);
}

