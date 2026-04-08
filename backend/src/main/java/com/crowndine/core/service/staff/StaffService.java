package com.crowndine.core.service.staff;

import com.crowndine.presentation.dto.request.StaffCreateRequest;
import com.crowndine.presentation.dto.request.UpdateProfileRequest;
import com.crowndine.presentation.dto.response.ProfileResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface StaffService {

    ProfileResponse createStaff(StaffCreateRequest request);

    ProfileResponse updateStaff(Long userId, UpdateProfileRequest request);

    void deleteStaff(Long userId);

    void changeStaffStatus(Long userId, com.crowndine.common.enums.EUserStatus status);

    ProfileResponse getStaffById(Long userId);

    java.util.List<ProfileResponse> getAllStaffs();

    Page<ProfileResponse> searchStaff(String name, Pageable pageable);
}
