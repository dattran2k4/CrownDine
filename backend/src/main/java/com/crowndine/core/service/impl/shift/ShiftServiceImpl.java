package com.crowndine.core.service.impl.shift;

import com.crowndine.presentation.dto.request.ShiftRequest;
import com.crowndine.presentation.dto.response.ShiftResponse;
import com.crowndine.presentation.exception.InvalidDataException;
import com.crowndine.presentation.exception.ResourceNotFoundException;
import com.crowndine.core.entity.Shift;
import com.crowndine.core.repository.ShiftRepository;
import com.crowndine.core.service.shift.ShiftService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j(topic = "MAIL-SERVICE")
public class ShiftServiceImpl implements ShiftService {

    private final ShiftRepository shiftRepository;

    @Override
    public ShiftResponse getShiftById(Long id) {
        Shift shift = getShift(id);
        return toResponse(shift);
    }

    @Override
    public List<ShiftResponse> getAllShifts() {
        return shiftRepository.findAll().stream().map(this::toResponse).toList();
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public void saveShift(ShiftRequest request) {
        log.info("Processing saving shift: ");

        validate(request);

        Shift shift;
        if (request.getId() != null && request.getId() > 0) {
            log.info("Updating shift with id={}", request.getId());
            shift = getShift(request.getId());
        } else {
            log.info("Creating new shift");
            shift = new Shift();
        }
        shift.setName(request.getName());
        shift.setStartTime(request.getStartTime());
        shift.setEndTime(request.getEndTime());
        shiftRepository.save(shift);

        log.info("Saved shift successfully");
    }

    @Override
    public void delete(Long id) {
        log.info("Deleting shift by id: {}: ", id);
        shiftRepository.delete(getShift(id));

        log.info("Deleted shift successfully");
    }

    private void validate(ShiftRequest request) {
        log.info("Validating shift request");

        if (!request.getStartTime().isBefore(request.getEndTime())) {
            throw new InvalidDataException("Start time must be before end time");
        }

        if (shiftRepository.existsOverlap(request.getStartTime(), request.getEndTime(), request.getId())) {
            throw new InvalidDataException("Shift already exists");
        }

        log.info("Validating shift request successfully");
    }

    private ShiftResponse toResponse(Shift shift) {
        return ShiftResponse.builder()
                .id(shift.getId())
                .name(shift.getName())
                .startTime(shift.getStartTime())
                .endTime(shift.getEndTime())
                .build();
    }

    private Shift getShift(Long id) {
        return shiftRepository.findById(id).orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy ca"));
    }
}
