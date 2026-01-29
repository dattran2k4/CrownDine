package com.crowndine.controller;

import com.crowndine.dto.request.AreaRequest;
import com.crowndine.dto.request.FloorRequest;
import com.crowndine.dto.request.TableRequest;
import com.crowndine.dto.request.LayoutSaveRequest;
import com.crowndine.dto.response.ApiResponse;
import com.crowndine.dto.response.FloorLayoutResponse;
import com.crowndine.service.layout.AreaService;
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
    public ApiResponse createFloor(@Valid @RequestBody FloorRequest request) {
        log.info("Create floor name={}", request.getName());
        return ApiResponse.builder()
                .status(200)
                .message("Create floor successfully")
                .data(floorService.create(request))
                .build();
    }

    @PutMapping("/floors/{id}")
    public ApiResponse updateFloor(
            @PathVariable Long id,
            @Valid @RequestBody FloorRequest request) {

        log.info("Update floor id={}", id);
        return ApiResponse.builder()
                .status(200)
                .message("Update floor successfully")
                .data(floorService.update(id, request))
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
            @Valid @RequestBody AreaRequest request) {

        log.info("Create area for floorId={}", floorId);
        return ApiResponse.builder()
                .status(200)
                .message("Create area successfully")
                .data(areaService.create(floorId, request))
                .build();
    }

    @PutMapping("/areas/{id}")
    public ApiResponse updateArea(
            @PathVariable Long id,
            @Valid @RequestBody AreaRequest request) {

        log.info("Update area id={}", id);
        return ApiResponse.builder()
                .status(200)
                .message("Update area successfully")
                .data(areaService.update(id, request))
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
            @Valid @RequestBody TableRequest request) {

        log.info("Create table for areaId={}", areaId);
        return ApiResponse.builder()
                .status(200)
                .message("Create table successfully")
                .data(tableService.create(areaId, request))
                .build();
    }

    @PutMapping("/tables/{id}")
    public ApiResponse updateTable(
            @PathVariable Long id,
            @Valid @RequestBody TableRequest request) {

        log.info("Update table id={}", id);
        return ApiResponse.builder()
                .status(200)
                .message("Update table successfully")
                .data(tableService.update(id, request))
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

    /* ======================= SAVE FULL LAYOUT ======================= */

    @PostMapping("/floors/{floorId}/save")
    public ApiResponse saveLayout(
            @PathVariable Long floorId,
            @Valid @RequestBody LayoutSaveRequest request) {

        log.info("Save layout for floorId={}", floorId);

        FloorLayoutResponse response =
                floorLayoutService.saveLayout(floorId, request);

        return ApiResponse.builder()
                .status(200)
                .message("Save layout successfully")
                .data(response)
                .build();
    }
}
