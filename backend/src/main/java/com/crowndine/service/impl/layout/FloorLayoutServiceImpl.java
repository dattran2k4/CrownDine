package com.crowndine.service.impl.layout;

import com.crowndine.dto.response.AreaLayoutResponse;
import com.crowndine.dto.response.FloorLayoutResponse;
import com.crowndine.exception.ResourceNotFoundException;
import com.crowndine.model.*;
import com.crowndine.repository.*;
import com.crowndine.service.layout.FloorLayoutService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class FloorLayoutServiceImpl implements FloorLayoutService {

    private final FloorRepository floorRepository;
    private final AreaRepository areaRepository;
    private final RestaurantTableRepository tableRepository;
    private final FloorFeatureRepository featureRepository;

    @Override
    public FloorLayoutResponse loadLayout(Long floorId) {

        log.info("Load layout for floorId={}", floorId);

        Floor floor = floorRepository.findById(floorId)
                .orElseThrow(() -> new ResourceNotFoundException("Floor not found"));

        List<Area> areas = areaRepository.findByFloorId(floorId);
        List<Long> areaIds = areas.stream().map(Area::getId).toList();

        Map<Long, List<RestaurantTable>> tableMap =
                tableRepository.findByAreaIdIn(areaIds)
                        .stream()
                        .collect(Collectors.groupingBy(t -> t.getArea().getId()));

        Map<Long, List<FloorFeature>> featureMap =
                featureRepository.findByAreaIdIn(areaIds)
                        .stream()
                        .collect(Collectors.groupingBy(f -> f.getArea().getId()));

        FloorLayoutResponse response = new FloorLayoutResponse();
        response.setFloorId(floor.getId());
        response.setFloorName(floor.getName());

        response.setAreas(
                areas.stream().map(area -> {
                    AreaLayoutResponse dto = new AreaLayoutResponse();
                    dto.setAreaId(area.getId());
                    dto.setAreaName(area.getName());
                    dto.setTables(tableMap.getOrDefault(area.getId(), List.of()));
                    dto.setFeatures(featureMap.getOrDefault(area.getId(), List.of()));
                    return dto;
                }).toList()
        );

        return response;
    }
}
