package com.crowndine.core.service.impl.staff;

import com.crowndine.common.enums.ERole;
import com.crowndine.common.enums.EUserStatus;
import com.crowndine.presentation.dto.request.StaffCreateRequest;
import com.crowndine.presentation.dto.request.UpdateProfileRequest;
import com.crowndine.presentation.dto.response.ProfileResponse;
import com.crowndine.presentation.exception.InvalidDataException;
import com.crowndine.presentation.exception.ResourceNotFoundException;
import com.crowndine.core.entity.Role;
import com.crowndine.core.entity.User;
import com.crowndine.core.repository.RoleRepository;
import com.crowndine.core.repository.UserRepository;
import com.crowndine.core.service.staff.StaffService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Slf4j(topic = "ADMIN-STAFF-SERVICE")
public class StaffServiceImpl implements StaffService {

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final PasswordEncoder passwordEncoder;

    // ================= CREATE STAFF =================
    @Override
    @Transactional(rollbackFor = Exception.class)
    public ProfileResponse createStaff(StaffCreateRequest request) {

        log.info("Processing create staff with username {}", request.getUsername());

        if (userRepository.existsByUsername(request.getUsername())) {
            throw new InvalidDataException("Username already exists");
        }

        if (userRepository.existsByEmail(request.getEmail())) {
            throw new InvalidDataException("Email already exists");
        }

        Role staffRole = roleRepository.findByName(ERole.STAFF);

        User user = new User();
        user.setUsername(request.getUsername());
        user.setFirstName(request.getFirstName().trim().toUpperCase()); // ✅
        user.setLastName(request.getLastName().trim().toUpperCase()); // ✅
        user.setEmail(request.getEmail());
        user.setPhone(request.getPhone());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setStatus(EUserStatus.ACTIVE);

        user.getRoles().add(staffRole);

        userRepository.save(user);

        log.info("Successfully created staff with id {}", user.getId());
        return buildProfileResponse(user);
    }

    // ================= UPDATE STAFF =================
    @Override
    @Transactional(rollbackFor = Exception.class)
    public ProfileResponse updateStaff(Long userId, UpdateProfileRequest request) {

        log.info("Processing update staff profile with id {}", userId);

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        user.setFirstName(request.getFirstName().trim().toUpperCase());
        user.setLastName(request.getLastName().trim().toUpperCase());
        user.setGender(request.getGender());
        user.setDateOfBirth(request.getDateOfBirth());

        userRepository.save(user);

        log.info("Successfully updated staff profile with id {}", userId);
        return buildProfileResponse(user);
    }

    // ================= DELETE STAFF =================
    @Override
    @Transactional(rollbackFor = Exception.class)
    public void deleteStaff(Long userId) {

        log.info("Processing HARD delete staff with id {}", userId);

        try {
            User user = userRepository.findById(userId)
                    .orElseThrow(() -> new ResourceNotFoundException("User not found"));
            userRepository.delete(user);
            userRepository.flush(); // Cố tình flush để bắt luôn DataIntegrityViolationException nếu có
            log.info("Successfully deleted staff with id {}", userId);
        } catch (org.springframework.dao.DataIntegrityViolationException e) {
            log.warn("Cannot delete staff {} due to foreign key constraints", userId);
            throw new InvalidDataException("Không thể xóa nhân viên này vì đã có dữ liệu ràng buộc (lịch làm việc, hóa đơn...). Vui lòng Khóa tài khoản thay vì xóa.");
        }
    }

    // ================= CHANGE STAFF STATUS =================
    @Override
    @Transactional(rollbackFor = Exception.class)
    public void changeStaffStatus(Long userId, EUserStatus status) {

        log.info("Processing change staff {} status to {}", userId, status);

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        user.setStatus(status);
        userRepository.save(user);

        log.info("Successfully changed staff status with id {}", userId);
    }

    // ================= GET STAFF BY ID =================
    @Override
    public ProfileResponse getStaffById(Long userId) {

        log.info("Processing get staff with id {}", userId);

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        return buildProfileResponse(user);
    }

    // ================= SEARCH STAFF =================
    @Override
    public Page<ProfileResponse> searchStaff(String name, Pageable pageable) {

        log.info("Processing search staff with name {}", name);

        return userRepository
                .searchStaffByName(name, pageable)
                .map(this::buildProfileResponse);
    }

    // ================= GET ALL STAFF =================
    @Override
    public java.util.List<ProfileResponse> getAllStaffs() {
        log.info("Processing get all staffs");

        return userRepository.findAllStaffs()
                .stream()
                .map(this::buildProfileResponse)
                .collect(java.util.stream.Collectors.toList());
    }

    // ================= MAP RESPONSE =================
    private ProfileResponse buildProfileResponse(User user) {

        return ProfileResponse.builder()
                .id(user.getId())
                .username(user.getUsername())
                .firstName(user.getFirstName())
                .lastName(user.getLastName())
                .email(user.getEmail())
                .phone(user.getPhone())
                .gender(user.getGender())
                .dateOfBirth(user.getDateOfBirth())
                .status(user.getStatus())
                .avatarUrl(user.getAvatarUrl())
                .build();
    }
}
