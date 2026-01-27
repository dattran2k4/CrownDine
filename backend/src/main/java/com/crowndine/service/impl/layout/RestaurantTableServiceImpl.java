package com.crowndine.service.impl.layout;

import com.crowndine.exception.ResourceNotFoundException;
import com.crowndine.model.Area;
import com.crowndine.model.RestaurantTable;
import com.crowndine.repository.AreaRepository;
import com.crowndine.repository.RestaurantTableRepository;
import com.crowndine.service.layout.RestaurantTableService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
@Slf4j
public class RestaurantTableServiceImpl implements RestaurantTableService {

    private final RestaurantTableRepository tableRepository;
    private final AreaRepository areaRepository;

    @Override
    public RestaurantTable create(RestaurantTable table, Long areaId) {
        Area area = areaRepository.findById(areaId)
                .orElseThrow(() -> new ResourceNotFoundException("Area not found"));
        table.setArea(area);
        return tableRepository.save(table);
    }

    @Override
    public RestaurantTable update(Long id, RestaurantTable table) {
        RestaurantTable existing = tableRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Table not found"));

        existing.setName(table.getName());
        existing.setCapacity(table.getCapacity());
        existing.setBaseDeposit(table.getBaseDeposit());
        existing.setPositionX(table.getPositionX());
        existing.setPositionY(table.getPositionY());
        existing.setWidth(table.getWidth());
        existing.setHeight(table.getHeight());
        existing.setRotation(table.getRotation());
        existing.setShape(table.getShape());

        return tableRepository.save(existing);
    }

    @Override
    public void delete(Long id) {
        tableRepository.deleteById(id);
    }
}
