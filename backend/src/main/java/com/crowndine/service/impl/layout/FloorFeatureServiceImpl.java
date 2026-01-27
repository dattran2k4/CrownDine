package com.crowndine.service.impl.layout;

import com.crowndine.exception.ResourceNotFoundException;
import com.crowndine.model.Area;
import com.crowndine.model.FloorFeature;
import com.crowndine.repository.AreaRepository;
import com.crowndine.repository.FloorFeatureRepository;
import com.crowndine.service.layout.FloorFeatureService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
@Slf4j
public class FloorFeatureServiceImpl implements FloorFeatureService {

    private final FloorFeatureRepository featureRepository;
    private final AreaRepository areaRepository;

    @Override
    public FloorFeature create(FloorFeature feature, Long areaId) {
        Area area = areaRepository.findById(areaId)
                .orElseThrow(() -> new ResourceNotFoundException("Area not found"));
        feature.setArea(area);
        return featureRepository.save(feature);
    }

    @Override
    public FloorFeature update(Long id, FloorFeature feature) {
        FloorFeature existing = featureRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Feature not found"));

        existing.setType(feature.getType());
        existing.setLabel(feature.getLabel());
        existing.setPositionX(feature.getPositionX());
        existing.setPositionY(feature.getPositionY());
        existing.setWidth(feature.getWidth());
        existing.setHeight(feature.getHeight());
        existing.setRotation(feature.getRotation());

        return featureRepository.save(existing);
    }

    @Override
    public void delete(Long id) {
        featureRepository.deleteById(id);
    }
}

