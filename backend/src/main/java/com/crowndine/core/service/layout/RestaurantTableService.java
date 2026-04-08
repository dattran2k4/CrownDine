package com.crowndine.core.service.layout;

import com.crowndine.common.enums.ETableStatus;
import com.crowndine.presentation.dto.request.TableRequest;
import com.crowndine.presentation.dto.response.RestaurantTableResponse;
import com.crowndine.presentation.dto.response.TableLayoutResponse;
import com.crowndine.presentation.dto.response.TableResponse;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

public interface RestaurantTableService {

    TableLayoutResponse create(Long areaId, TableRequest request);

    TableLayoutResponse update(Long id, TableRequest request);

    void delete(Long id);

    List<TableLayoutResponse> getTablesForReservation(LocalDate date, LocalTime startTime, Integer guestNumber);

    List<RestaurantTableResponse> getAllTables();

    RestaurantTableResponse updateTableStatus(Long id, ETableStatus status);

}
