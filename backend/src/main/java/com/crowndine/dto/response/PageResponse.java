package com.crowndine.dto.response;

import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
@Builder
public class PageResponse<T> {
    private int pageNumber;
    private int pageSize;
    private Long totalElements;
    private int totalPages;
    private transient List<T> data;
}
