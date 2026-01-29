package com.crowndine.service.impl.layout;

import com.crowndine.common.enums.ETableStatus;
import com.crowndine.dto.request.TableRequest;
import com.crowndine.dto.response.TableLayoutResponse;
import com.crowndine.exception.ResourceNotFoundException;
import com.crowndine.model.Area;
import com.crowndine.model.RestaurantTable;
import com.crowndine.repository.AreaRepository;
import com.crowndine.repository.RestaurantTableRepository;
import com.crowndine.service.layout.RestaurantTableService;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
@Transactional
public class RestaurantTableServiceImpl implements RestaurantTableService {

    private final RestaurantTableRepository tableRepository;
    private final AreaRepository areaRepository;

    @Override
    public TableLayoutResponse create(Long areaId, TableRequest request) {

        Area area = areaRepository.findById(areaId)
                .orElseThrow(() ->
                        new ResourceNotFoundException("Area not found"));

        RestaurantTable table = new RestaurantTable();
        table.setName(request.getName());
        table.setCapacity(request.getCapacity());
        table.setShape(request.getShape());
        table.setStatus(
                request.getStatus() != null
                        ? request.getStatus()
                        : ETableStatus.AVAILABLE
        );
        table.setArea(area);

        return map(tableRepository.save(table));
    }

    @Override
    public TableLayoutResponse update(Long id, TableRequest request) {

        RestaurantTable table = tableRepository.findById(id)
                .orElseThrow(() ->
                        new ResourceNotFoundException("Table not found"));

        table.setName(request.getName());
        table.setCapacity(request.getCapacity());
        table.setShape(request.getShape());
        table.setStatus(request.getStatus());

        return map(tableRepository.save(table));
    }

    @Override
    public void delete(Long id) {
        tableRepository.deleteById(id);
    }

    private TableLayoutResponse map(RestaurantTable table) {
        TableLayoutResponse dto = new TableLayoutResponse();
        dto.setId(table.getId());
        dto.setName(table.getName());
        dto.setShape(table.getShape());
        dto.setStatus(table.getStatus());
        dto.setX(table.getPositionX());
        dto.setY(table.getPositionY());
        dto.setWidth(table.getWidth());
        dto.setHeight(table.getHeight());
        dto.setRotation(table.getRotation());
        return dto;
    }
}
