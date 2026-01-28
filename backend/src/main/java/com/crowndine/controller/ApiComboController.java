package com.crowndine.controller;


import com.crowndine.dto.request.ComboRequest;
import com.crowndine.dto.response.ApiResponse;
import com.crowndine.dto.response.ComboResponse;
import com.crowndine.service.combo.ComboService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/combos")
@RequiredArgsConstructor
@Validated
@Slf4j(topic = "API-COMBO-CONTROLLER")
public class ApiComboController {

    private final ComboService comboService;

    @GetMapping
    public ApiResponse getAllCombos(){
        log.info("Get all combos request");
        List<ComboResponse> combos = comboService.getAllCombos();
        return ApiResponse.builder().status(HttpStatus.OK.value()).message("Lấy danh sách combo thành công").data(combos).build();
    }

    @GetMapping("/{id}")
    public ApiResponse getComboById(@PathVariable Long id){
        log.info("Get combo request with id: {}", id);
        ComboResponse combo = comboService.getComboById(id);
        return ApiResponse.builder()
                .status(HttpStatus.OK.value())
                .message("Lấy thông tin combo thành công")
                .data(combo)
                .build();
    }

    @GetMapping("/name/{name}")
    public ApiResponse getComboByName(@PathVariable String name){
        log.info("Get item request with name: {}", name );
        ComboResponse combo = comboService.getComboByName(name);
        return ApiResponse.builder()
                .status(HttpStatus.OK.value())
                .message("Lấy thông tin combo thành công")
                .data(combo)
                .build();
    }
    @PostMapping
    public ApiResponse createCombo(@Valid @RequestBody ComboRequest request){
        log.info("Create combo request: {}", request.getName());
        ComboResponse combo = comboService.createCombo(request);
        return ApiResponse.builder()
                .status(HttpStatus.CREATED.value())
                .message("Tạo danh mục thành công")
                .data(combo)
                .build();
    }
    @PutMapping("/{id}")
    public ApiResponse updateCombo(@PathVariable Long id, @Valid @RequestBody ComboRequest request){
        log.info("Update combo request id: {}", id);
        ComboResponse combo = comboService.updateCombo(id, request);
        return ApiResponse.builder()
                .status(HttpStatus.OK.value())
                .message("Cập nhật danh mục thành công")
                .data(combo)
                .build();
    }
    @DeleteMapping("/{id}")
    public ApiResponse deleteItem(@PathVariable Long id) {
        log.info("Delete Item request id: {}", id);
        comboService.deleteCombo(id);
        return ApiResponse.builder()
                .status(HttpStatus.OK.value())
                .message("Xóa danh mục thành công")
                .build();
    }
}
