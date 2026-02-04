package com.crowndine.service.staff;

import com.crowndine.dto.request.StaffCreateRequest;
import com.crowndine.dto.request.UpdateProfileRequest;
import com.crowndine.dto.response.ProfileResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface StaffService {

    ProfileResponse createStaff(StaffCreateRequest request);

    ProfileResponse updateStaff(Long userId, UpdateProfileRequest request);

    void deactivateStaff(Long userId);

    ProfileResponse getStaffById(Long userId);

    Page<ProfileResponse> searchStaff(String name, Pageable pageable);
}
