package com.crowndine.controller;

import com.crowndine.dto.request.StaffCreateRequest;
import com.crowndine.dto.request.UpdateProfileRequest;
import com.crowndine.dto.response.ApiResponse;
import com.crowndine.dto.response.ProfileResponse;
import com.crowndine.service.staff.StaffService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

@RestController
@Validated
@RequiredArgsConstructor
@RequestMapping("/api/admin/staff")
@Slf4j(topic = "API-STAFF-CONTROLLER")
public class ApiStaffController {

        private final StaffService staffService;

        // ================= CREATE =================
        @PostMapping
        @PreAuthorize("hasAuthority('ADMIN')")
        public ApiResponse createStaff(
                        @Valid @RequestBody StaffCreateRequest request) {

                ProfileResponse response = staffService.createStaff(request);

                return ApiResponse.builder()
                                .status(200)
                                .message("Create staff successfully")
                                .data(response)
                                .build();
        }

        @GetMapping("/all")
        @PreAuthorize("hasAnyAuthority('ADMIN', 'STAFF')")
        public ApiResponse getAllStaffs() {

                java.util.List<ProfileResponse> response = staffService.getAllStaffs();

                return ApiResponse.builder()
                                .status(200)
                                .message("Get all staff successfully")
                                .data(response)
                                .build();
        }

        // ================= UPDATE PROFILE =================
        @PutMapping("/{id}")
        @PreAuthorize("hasAuthority('ADMIN')")
        public ApiResponse updateStaff(
                        @PathVariable Long id,
                        @Valid @RequestBody UpdateProfileRequest request) {

                ProfileResponse response = staffService.updateStaff(id, request);

                return ApiResponse.builder()
                                .status(200)
                                .message("Update staff profile successfully")
                                .data(response)
                                .build();
        }

        // ================= DEACTIVATE =================
        @DeleteMapping("/{id}")
        @PreAuthorize("hasAuthority('ADMIN')")
        public ApiResponse deactivateStaff(@PathVariable Long id) {

                staffService.deactivateStaff(id);

                return ApiResponse.builder()
                                .status(200)
                                .message("Deactivate staff successfully")
                                .build();
        }

        // ================= GET BY ID =================
        @GetMapping("/{id}")
        @PreAuthorize("hasAnyAuthority('ADMIN', 'STAFF')")
        public ApiResponse getStaffById(@PathVariable Long id) {

                ProfileResponse response = staffService.getStaffById(id);

                return ApiResponse.builder()
                                .status(200)
                                .message("Get staff successfully")
                                .data(response)
                                .build();
        }

        // ================= SEARCH =================
        @GetMapping("/search")
        @PreAuthorize("hasAnyAuthority('ADMIN', 'STAFF')")
        public ApiResponse searchStaff(
                        @RequestParam(required = false) String name,
                        Pageable pageable) {

                Page<ProfileResponse> response = staffService.searchStaff(name, pageable);

                return ApiResponse.builder()
                                .status(200)
                                .message("Search staff successfully")
                                .data(response)
                                .build();
        }
}
