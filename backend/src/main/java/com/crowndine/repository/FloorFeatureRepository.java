package com.crowndine.repository;

import com.crowndine.model.FloorFeature;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface FloorFeatureRepository
        extends JpaRepository<FloorFeature, Long> {
    List<FloorFeature> findByAreaIdIn(List<Long> areaIds);
}

