package com.crowndine.service.layout;
import com.crowndine.dto.request.FloorRequest;
import com.crowndine.dto.response.FloorResponse;

import java.util.List;

public interface FloorService {

    FloorResponse create(FloorRequest request);

    FloorResponse update(Long id, FloorRequest request);

    List<FloorResponse> getAll();

    FloorResponse getById(Long id);

    void delete(Long id);
}



