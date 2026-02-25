package com.crowndine.service.layout;

import com.crowndine.dto.request.TableRequest;
import com.crowndine.dto.response.TableLayoutResponse;
import com.crowndine.dto.response.TableResponse;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

public interface RestaurantTableService {

    TableLayoutResponse create(Long areaId, TableRequest request);

    TableLayoutResponse update(Long id, TableRequest request);

    void delete(Long id);

    List<TableLayoutResponse> getAvailableTablesForReservation(LocalDate date, LocalTime startTime, LocalTime endTime, Integer guestNumber);
}


