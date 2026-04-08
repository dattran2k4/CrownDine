package com.crowndine.core.service.layout;

import com.crowndine.presentation.dto.request.LayoutSaveRequest;
import com.crowndine.presentation.dto.response.FloorLayoutResponse;

public interface FloorLayoutService {

    FloorLayoutResponse loadLayout(Long floorId);

    FloorLayoutResponse saveLayout(Long floorId, LayoutSaveRequest request);
}

