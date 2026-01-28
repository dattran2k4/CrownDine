package com.crowndine.service.layout;

import com.crowndine.dto.request.LayoutSaveRequest;
import com.crowndine.dto.response.FloorLayoutResponse;

public interface FloorLayoutService {

    FloorLayoutResponse loadLayout(Long floorId);

    FloorLayoutResponse saveLayout(Long floorId, LayoutSaveRequest request);
}

