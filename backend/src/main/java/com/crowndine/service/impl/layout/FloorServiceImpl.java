package com.crowndine.service.impl.layout;

import com.crowndine.dto.request.FloorRequest;
import com.crowndine.dto.response.FloorResponse;
import com.crowndine.exception.ResourceNotFoundException;
import com.crowndine.model.Floor;
import com.crowndine.repository.FloorRepository;
import com.crowndine.service.layout.FloorService;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class FloorServiceImpl implements FloorService {

    private final FloorRepository floorRepository;

    @Override
    public FloorResponse create(FloorRequest request) {

        Floor floor = new Floor();
        floor.setName(request.getName());
        floor.setFloorNumber(request.getFloorNumber());
        floor.setDescription(request.getDescription());

        return map(floorRepository.save(floor));
    }

    @Override
    public FloorResponse update(Long id, FloorRequest request) {

        Floor floor = floorRepository.findById(id)
                .orElseThrow(() ->
                        new ResourceNotFoundException("Floor not found"));

        floor.setName(request.getName());
        floor.setFloorNumber(request.getFloorNumber());
        floor.setDescription(request.getDescription());

        return map(floorRepository.save(floor));
    }

    @Override
    public List<FloorResponse> getAll() {
        return floorRepository.findAll()
                .stream()
                .map(this::map)
                .toList();
    }

    @Override
    public FloorResponse getById(Long id) {
        return map(
                floorRepository.findById(id)
                        .orElseThrow(() ->
                                new ResourceNotFoundException("Floor not found"))
        );
    }

    @Override
    public void delete(Long id) {
        floorRepository.deleteById(id);
    }

    private FloorResponse map(Floor floor) {
        FloorResponse dto = new FloorResponse();
        dto.setId(floor.getId());
        dto.setName(floor.getName());
        dto.setFloorNumber(floor.getFloorNumber());
        dto.setDescription(floor.getDescription());
        return dto;
    }
}

