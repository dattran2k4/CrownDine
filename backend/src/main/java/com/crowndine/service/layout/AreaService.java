package com.crowndine.service.layout;

import com.crowndine.dto.request.AreaRequest;
import com.crowndine.dto.response.AreaResponse;

public interface AreaService {

    AreaResponse create(Long floorId, AreaRequest request);

    AreaResponse update(Long id, AreaRequest request);

    void delete(Long id);
}

