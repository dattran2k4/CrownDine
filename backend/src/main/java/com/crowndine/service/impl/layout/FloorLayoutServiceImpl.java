package com.crowndine.service.impl.layout;

import com.crowndine.dto.request.AreaLayoutSaveRequest;
import com.crowndine.dto.request.LayoutObjectSaveRequest;
import com.crowndine.dto.request.LayoutSaveRequest;
import com.crowndine.dto.response.AreaLayoutResponse;
import com.crowndine.dto.response.FloorLayoutResponse;
import com.crowndine.dto.response.TableLayoutResponse;
import com.crowndine.exception.ResourceNotFoundException;
import com.crowndine.model.Area;
import com.crowndine.model.Floor;
import com.crowndine.model.RestaurantTable;
import com.crowndine.repository.AreaRepository;
import com.crowndine.repository.FloorRepository;
import com.crowndine.repository.RestaurantTableRepository;
import com.crowndine.service.layout.FloorLayoutService;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class FloorLayoutServiceImpl implements FloorLayoutService {

    private final FloorRepository floorRepository;
    private final AreaRepository areaRepository;
    private final RestaurantTableRepository tableRepository;

    /* ================= SAVE LAYOUT ================= */

    @Override
    public FloorLayoutResponse saveLayout(
            Long floorId,
            LayoutSaveRequest request) {

        log.info("Save layout for floorId={}", floorId);

        // Validate floor
        floorRepository.findById(floorId)
                .orElseThrow(() ->
                        new ResourceNotFoundException("Floor not found"));

        for (AreaLayoutSaveRequest areaReq : request.getAreas()) {

            Area area = areaRepository.findById(areaReq.getAreaId())
                    .orElseThrow(() ->
                            new ResourceNotFoundException("Area not found"));

            for (LayoutObjectSaveRequest obj : areaReq.getObjects()) {

                RestaurantTable table = tableRepository.findById(obj.getId())
                        .orElseThrow(() ->
                                new ResourceNotFoundException("Table not found"));

                table.setPositionX(obj.getX());
                table.setPositionY(obj.getY());
                table.setWidth(obj.getWidth());
                table.setHeight(obj.getHeight());
                table.setRotation(obj.getRotation());

                tableRepository.save(table);
            }
        }

        // Sau khi save xong → load lại layout
        return loadLayout(floorId);
    }

    /* ================= LOAD LAYOUT ================= */

    @Override
    public FloorLayoutResponse loadLayout(Long floorId) {

        Floor floor = floorRepository.findById(floorId)
                .orElseThrow(() ->
                        new ResourceNotFoundException("Floor not found"));

        List<AreaLayoutResponse> areaResponses =
                areaRepository.findByFloorId(floorId)
                        .stream()
                        .map(this::mapArea)
                        .collect(Collectors.toList());

        FloorLayoutResponse response = new FloorLayoutResponse();
        response.setFloorId(floor.getId());
        response.setFloorName(floor.getName());
        response.setAreas(areaResponses);

        return response;
    }

    /* ================= MAPPING ================= */

    private TableLayoutResponse mapTable(RestaurantTable table) {

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

    private AreaLayoutResponse mapArea(Area area) {

        AreaLayoutResponse dto = new AreaLayoutResponse();
        dto.setAreaId(area.getId());
        dto.setAreaName(area.getName());

        List<TableLayoutResponse> tables =
                tableRepository.findByAreaId(area.getId())
                        .stream()
                        .map(this::mapTable)
                        .toList();

        dto.setTables(tables);
        return dto;
    }

}
