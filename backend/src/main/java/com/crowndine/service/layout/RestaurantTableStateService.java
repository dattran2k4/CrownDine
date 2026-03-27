package com.crowndine.service.layout;

public interface RestaurantTableStateService {

    void markAvailable(Long tableId);

    void markReserved(Long tableId);

    void markOccupied(Long tableId);
}
