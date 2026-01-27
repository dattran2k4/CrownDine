package com.crowndine.controller;

import com.crowndine.dto.response.ApiResponse;
import com.crowndine.dto.response.FloorLayoutResponse;
import com.crowndine.model.Area;
import com.crowndine.model.Floor;
import com.crowndine.model.FloorFeature;
import com.crowndine.model.RestaurantTable;
import com.crowndine.service.layout.AreaService;
import com.crowndine.service.layout.FloorFeatureService;
import com.crowndine.service.layout.FloorLayoutService;
import com.crowndine.service.layout.FloorService;
import com.crowndine.service.layout.RestaurantTableService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

@RestController
@Validated
@RequiredArgsConstructor
@RequestMapping("/api/layout")
@Slf4j(topic = "API-FLOOR-LAYOUT-CONTROLLER")
public class ApiFloorLayoutController {

    private final FloorService floorService;
    private final AreaService areaService;
    private final RestaurantTableService tableService;
    private final FloorFeatureService featureService;
    private final FloorLayoutService floorLayoutService;

    /* ======================= FLOOR ======================= */

    @GetMapping("/floors")
    public ApiResponse getAllFloors() {
        log.info("Get all floors");
        return ApiResponse.builder()
                .status(200)
                .message("Get list floors successfully")
                .data(floorService.getAll())
                .build();
    }

    @PostMapping("/floors")
    public ApiResponse createFloor(@Valid @RequestBody Floor floor) {
        log.info("Create floor name={}", floor.getName());
        return ApiResponse.builder()
                .status(200)
                .message("Create floor successfully")
                .data(floorService.create(floor))
                .build();
    }

    @PutMapping("/floors/{id}")
    public ApiResponse updateFloor(
            @PathVariable Long id,
            @Valid @RequestBody Floor floor) {

        log.info("Update floor id={}", id);
        return ApiResponse.builder()
                .status(200)
                .message("Update floor successfully")
                .data(floorService.update(id, floor))
                .build();
    }

    @DeleteMapping("/floors/{id}")
    public ApiResponse deleteFloor(@PathVariable Long id) {
        log.info("Delete floor id={}", id);
        floorService.delete(id);
        return ApiResponse.builder()
                .status(200)
                .message("Delete floor successfully")
                .build();
    }

    /* ======================= AREA ======================= */

    @PostMapping("/floors/{floorId}/areas")
    public ApiResponse createArea(
            @PathVariable Long floorId,
            @Valid @RequestBody Area area) {

        log.info("Create area for floorId={}", floorId);
        return ApiResponse.builder()
                .status(200)
                .message("Create area successfully")
                .data(areaService.create(area, floorId))
                .build();
    }

    @PutMapping("/areas/{id}")
    public ApiResponse updateArea(
            @PathVariable Long id,
            @Valid @RequestBody Area area) {

        log.info("Update area id={}", id);
        return ApiResponse.builder()
                .status(200)
                .message("Update area successfully")
                .data(areaService.update(id, area))
                .build();
    }

    @DeleteMapping("/areas/{id}")
    public ApiResponse deleteArea(@PathVariable Long id) {
        log.info("Delete area id={}", id);
        areaService.delete(id);
        return ApiResponse.builder()
                .status(200)
                .message("Delete area successfully")
                .build();
    }

    /* ======================= TABLE ======================= */

    @PostMapping("/areas/{areaId}/tables")
    public ApiResponse createTable(
            @PathVariable Long areaId,
            @Valid @RequestBody RestaurantTable table) {

        log.info("Create table for areaId={}", areaId);
        return ApiResponse.builder()
                .status(200)
                .message("Create table successfully")
                .data(tableService.create(table, areaId))
                .build();
    }

    @PutMapping("/tables/{id}")
    public ApiResponse updateTable(
            @PathVariable Long id,
            @Valid @RequestBody RestaurantTable table) {

        log.info("Update table id={}", id);
        return ApiResponse.builder()
                .status(200)
                .message("Update table successfully")
                .data(tableService.update(id, table))
                .build();
    }

    @DeleteMapping("/tables/{id}")
    public ApiResponse deleteTable(@PathVariable Long id) {
        log.info("Delete table id={}", id);
        tableService.delete(id);
        return ApiResponse.builder()
                .status(200)
                .message("Delete table successfully")
                .build();
    }

    /* ======================= FEATURE ======================= */

    @PostMapping("/areas/{areaId}/features")
    public ApiResponse createFeature(
            @PathVariable Long areaId,
            @Valid @RequestBody FloorFeature feature) {

        log.info("Create feature for areaId={}", areaId);
        return ApiResponse.builder()
                .status(200)
                .message("Create feature successfully")
                .data(featureService.create(feature, areaId))
                .build();
    }

    @PutMapping("/features/{id}")
    public ApiResponse updateFeature(
            @PathVariable Long id,
            @Valid @RequestBody FloorFeature feature) {

        log.info("Update feature id={}", id);
        return ApiResponse.builder()
                .status(200)
                .message("Update feature successfully")
                .data(featureService.update(id, feature))
                .build();
    }

    @DeleteMapping("/features/{id}")
    public ApiResponse deleteFeature(@PathVariable Long id) {
        log.info("Delete feature id={}", id);
        featureService.delete(id);
        return ApiResponse.builder()
                .status(200)
                .message("Delete feature successfully")
                .build();
    }

    /* ======================= LOAD FULL LAYOUT ======================= */

    @GetMapping("/floors/{floorId}/layout")
    public ApiResponse loadLayout(@PathVariable Long floorId) {

        log.info("Load layout for floorId={}", floorId);
        FloorLayoutResponse response =
                floorLayoutService.loadLayout(floorId);

        return ApiResponse.builder()
                .status(200)
                .message("Get floor layout successfully")
                .data(response)
                .build();
    }
}
