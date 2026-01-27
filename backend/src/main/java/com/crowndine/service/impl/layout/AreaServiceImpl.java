package com.crowndine.service.impl.layout;

import com.crowndine.exception.ResourceNotFoundException;
import com.crowndine.model.Area;
import com.crowndine.model.Floor;
import com.crowndine.repository.AreaRepository;
import com.crowndine.repository.FloorRepository;
import com.crowndine.service.layout.AreaService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class AreaServiceImpl implements AreaService {

    private final AreaRepository areaRepository;
    private final FloorRepository floorRepository;

    @Override
    public Area create(Area area, Long floorId) {
        Floor floor = floorRepository.findById(floorId)
                .orElseThrow(() -> new ResourceNotFoundException("Floor not found"));
        area.setFloor(floor);
        return areaRepository.save(area);
    }

    @Override
    public Area update(Long id, Area area) {
        Area existing = areaRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Area not found"));
        existing.setName(area.getName());
        existing.setDescription(area.getDescription());
        return areaRepository.save(existing);
    }

    @Override
    public void delete(Long id) {
        areaRepository.deleteById(id);
    }

    @Override
    public List<Area> getByFloor(Long floorId) {
        return areaRepository.findByFloorId(floorId);
    }
}

