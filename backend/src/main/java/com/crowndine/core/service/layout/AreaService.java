package com.crowndine.core.service.layout;

import com.crowndine.presentation.dto.request.AreaRequest;
import com.crowndine.presentation.dto.response.AreaResponse;

public interface AreaService {

    AreaResponse create(Long floorId, AreaRequest request);

    AreaResponse update(Long id, AreaRequest request);

    void delete(Long id);
}

