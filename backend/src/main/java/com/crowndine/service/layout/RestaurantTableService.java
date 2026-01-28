package com.crowndine.service.layout;

import com.crowndine.dto.request.TableRequest;
import com.crowndine.dto.response.TableLayoutResponse;

public interface RestaurantTableService {

    TableLayoutResponse create(Long areaId, TableRequest request);

    TableLayoutResponse update(Long id, TableRequest request);

    void delete(Long id);
}


