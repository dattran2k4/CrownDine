package com.crowndine.repository;

import com.crowndine.common.enums.ETableStatus;
import com.crowndine.model.RestaurantTable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.repository.query.Param;

import java.util.List;

@Repository
public interface RestaurantTableRepository
        extends JpaRepository<RestaurantTable, Long> {
    List<RestaurantTable> findByAreaId(Long areaIds);
    List<RestaurantTable> findByCapacityGreaterThanEqualAndStatusNotOrderByCapacityAsc(Integer capacity, ETableStatus status);
    @EntityGraph(attributePaths = {"area", "area.floor"})
    List<RestaurantTable> findByCapacityGreaterThanEqualAndStatusOrderByCapacityAsc(Integer capacity, ETableStatus status);

    @EntityGraph(attributePaths = {"area", "area.floor"})
    @Query("SELECT t FROM RestaurantTable t WHERE t.status = :status")
    List<RestaurantTable> findAllWithAreaAndFloor(@Param("status") ETableStatus status);

    @EntityGraph(attributePaths = {"area", "area.floor"})
    @Override
    List<RestaurantTable> findAll();
}
