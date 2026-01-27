package com.crowndine.service.layout;

import com.crowndine.model.RestaurantTable;

public interface RestaurantTableService {

    RestaurantTable create(RestaurantTable table, Long areaId);

    RestaurantTable update(Long id, RestaurantTable table);

    void delete(Long id);
}
