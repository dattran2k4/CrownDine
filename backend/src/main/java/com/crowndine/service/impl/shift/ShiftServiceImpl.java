package com.crowndine.service.impl.shift;

import com.crowndine.dto.request.ShiftRequest;
import com.crowndine.dto.response.ShiftResponse;
import com.crowndine.exception.InvalidDataException;
import com.crowndine.exception.ResourceNotFoundException;
import com.crowndine.model.Shift;
import com.crowndine.repository.ShiftRepository;
import com.crowndine.service.shift.ShiftService;
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
        ShiftResponse response = toResponse(shift);
        return response;
    }

    @Override
    public List<ShiftResponse> getAllShifts() {
        return shiftRepository.findAll().stream().map(this::toResponse).toList();
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public void saveShift(ShiftRequest request, String username) {
        log.info("Processing saving shift by user: {}: ", username);

        validate(request);

        Shift shift;
        if (request.getId() != null) {
            shift = getShift(request.getId());

            log.info("Saved shift by user: {}: ", username);
        } else {
            shift = new Shift();
        }
        shift.setName(request.getName());
        shift.setStartTime(request.getStartTime());
        shift.setEndTime(request.getEndTime());
        shiftRepository.save(shift);
        log.info("Saved shift successfully");
    }

    private void validate(ShiftRequest request) {

        if (!request.getStartTime().isBefore(request.getEndTime())) {
            throw new InvalidDataException("Start time must be before end time");
        }
        
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
