package com.crowndine.service.layout;

import com.crowndine.model.FloorFeature;

public interface FloorFeatureService {

    FloorFeature create(FloorFeature feature, Long areaId);

    FloorFeature update(Long id, FloorFeature feature);

    void delete(Long id);
}

