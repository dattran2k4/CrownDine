package com.crowndine.presentation.dto.request;

import lombok.Getter;
import lombok.Setter;
import java.util.List;

@Getter @Setter
public class LayoutSaveRequest {
    private List<AreaLayoutSaveRequest> areas;
}
