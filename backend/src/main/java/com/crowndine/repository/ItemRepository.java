package com.crowndine.repository;

import com.crowndine.common.enums.EItemStatus;
import com.crowndine.model.Item;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ItemRepository extends JpaRepository<Item, Long>, JpaSpecificationExecutor<Item> {
    Optional<Item> findByName(String name);

    List<Item> findTop10ByStatusOrderBySoldCountDesc(EItemStatus status);

    List<Item> findTop10ByStatusOrderBySoldCountAsc(EItemStatus status);
}
