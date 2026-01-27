package com.crowndine.service.shift;

import com.crowndine.dto.request.ShiftRequest;
import com.crowndine.dto.response.ShiftResponse;

import java.time.LocalTime;
import java.util.List;

public interface ShiftService {
    ShiftResponse getShiftById(Long id);

    List<ShiftResponse> getAllShifts();

    void saveShift(ShiftRequest request);

    void delete(Long id);
}
