package com.crowndine.core.service.impl.layout;

import com.crowndine.presentation.dto.request.AreaRequest;
import com.crowndine.presentation.dto.response.AreaResponse;
import com.crowndine.presentation.exception.ResourceNotFoundException;
import com.crowndine.core.entity.Area;
import com.crowndine.core.entity.Floor;
import com.crowndine.core.repository.AreaRepository;
import com.crowndine.core.repository.FloorRepository;
import com.crowndine.core.service.layout.AreaService;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class AreaServiceImpl implements AreaService {

    private final AreaRepository areaRepository;
    private final FloorRepository floorRepository;

    @Override
    public AreaResponse create(Long floorId, AreaRequest request) {

        Floor floor = floorRepository.findById(floorId)
                .orElseThrow(() ->
                        new ResourceNotFoundException("Floor not found"));

        Area area = new Area();
        area.setName(request.getName());
        area.setDescription(request.getDescription());
        area.setFloor(floor);

        return map(areaRepository.save(area));
    }

    @Override
    public AreaResponse update(Long id, AreaRequest request) {

        Area area = areaRepository.findById(id)
                .orElseThrow(() ->
                        new ResourceNotFoundException("Area not found"));

        area.setName(request.getName());
        area.setDescription(request.getDescription());

        return map(areaRepository.save(area));
    }

    @Override
    public void delete(Long id) {
        areaRepository.deleteById(id);
    }

    private AreaResponse map(Area area) {
        AreaResponse dto = new AreaResponse();
        dto.setId(area.getId());
        dto.setName(area.getName());
        dto.setDescription(area.getDescription());
        dto.setFloorId(area.getFloor().getId());
        return dto;
    }
}
