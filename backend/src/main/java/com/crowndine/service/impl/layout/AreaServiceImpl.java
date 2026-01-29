package com.crowndine.service.impl.layout;

import com.crowndine.dto.request.AreaRequest;
import com.crowndine.dto.response.AreaResponse;
import com.crowndine.exception.ResourceNotFoundException;
import com.crowndine.model.Area;
import com.crowndine.model.Floor;
import com.crowndine.repository.AreaRepository;
import com.crowndine.repository.FloorRepository;
import com.crowndine.service.layout.AreaService;
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
