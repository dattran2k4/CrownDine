package com.crowndine.dto.response;

import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

import java.util.List;

@Getter
@Builder
@Setter
public class PageResponse<T> {
    private int page;
    private int pageSize;
    private int totalPages;
    private long totalItems;
    private List<T> data;
}
