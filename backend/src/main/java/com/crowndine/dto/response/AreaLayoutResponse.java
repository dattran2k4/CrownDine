package com.crowndine.dto.response;

import lombok.Getter;
import lombok.Setter;
import java.util.List;

@Getter
@Setter
public class AreaLayoutResponse {

    private Long areaId;
    private String areaName;
    private List<TableLayoutResponse> tables;
}
