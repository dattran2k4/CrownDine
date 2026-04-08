package com.crowndine.core.repository;

import org.springframework.stereotype.Repository;
import org.springframework.data.jpa.repository.JpaRepository;
import com.crowndine.core.entity.ComboItem;

@Repository
public interface ComboItemRepository extends JpaRepository<ComboItem, Long> {
    void deleteByItemId(Long itemId);

    void deleteByComboId(Long comboId);
}
