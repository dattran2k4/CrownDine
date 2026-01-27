package com.crowndine.service.impl.layout;

import com.crowndine.exception.ResourceNotFoundException;
import com.crowndine.model.Floor;
import com.crowndine.repository.FloorRepository;
import com.crowndine.service.layout.FloorService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class FloorServiceImpl implements FloorService {

    private final FloorRepository floorRepository;

    @Override
    public Floor create(Floor floor) {
        log.info("Create floor name={}", floor.getName());
        return floorRepository.save(floor);
    }

    @Override
    public Floor update(Long id, Floor floor) {
        Floor existing = getById(id);
        existing.setName(floor.getName());
        existing.setFloorNumber(floor.getFloorNumber());
        existing.setDescription(floor.getDescription());
        return floorRepository.save(existing);
    }

    @Override
    public void delete(Long id) {
        floorRepository.delete(getById(id));
    }

    @Override
    public Floor getById(Long id) {
        return floorRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Floor not found"));
    }

    @Override
    public List<Floor> getAll() {
        return floorRepository.findAll();
    }
}

