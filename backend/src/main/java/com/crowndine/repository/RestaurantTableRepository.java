package com.crowndine.repository;

import com.crowndine.model.RestaurantTable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface RestaurantTableRepository
        extends JpaRepository<RestaurantTable, Long> {
    List<RestaurantTable> findByAreaId(Long areaIds);
}
