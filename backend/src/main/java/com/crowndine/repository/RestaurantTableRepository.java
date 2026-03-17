package com.crowndine.repository;

import com.crowndine.common.enums.ETableStatus;
import com.crowndine.model.RestaurantTable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
<<<<<<< HEAD
public interface RestaurantTableRepository
        extends JpaRepository<RestaurantTable, Long> {
    List<RestaurantTable> findByAreaId(Long areaIds);
    List<RestaurantTable> findByCapacityGreaterThanEqualAndStatusOrderByCapacityAsc(Integer capacity, ETableStatus status);
=======
public interface RestaurantTableRepository extends JpaRepository<RestaurantTable, Long> {
>>>>>>> main
}
