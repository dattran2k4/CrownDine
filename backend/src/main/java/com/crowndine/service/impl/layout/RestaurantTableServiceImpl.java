package com.crowndine.service.impl.layout;

import com.crowndine.common.enums.EReservationStatus;
import com.crowndine.common.enums.ETableStatus;
import com.crowndine.dto.request.TableRequest;
import com.crowndine.dto.response.RestaurantTableResponse;
import com.crowndine.dto.response.TableLayoutResponse;
import com.crowndine.dto.response.TableResponse;
import com.crowndine.exception.InvalidDataException;
import com.crowndine.exception.ResourceNotFoundException;
import com.crowndine.model.Area;
import com.crowndine.model.RestaurantTable;
import com.crowndine.repository.AreaRepository;
import com.crowndine.repository.ReservationRepository;
import com.crowndine.repository.RestaurantTableRepository;
import com.crowndine.service.layout.RestaurantTableService;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.BeanUtils;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

@Service
@RequiredArgsConstructor
@Transactional
@Slf4j(topic = "RESTAURANT-TABLE-SERVICE")
public class RestaurantTableServiceImpl implements RestaurantTableService {
    private static final long DEFAULT_RESERVATION_DURATION_HOURS = 4;
    private static final LocalTime OPEN_TIME = LocalTime.of(9, 0);

    private final RestaurantTableRepository tableRepository;
    private final AreaRepository areaRepository;
    private final ReservationRepository reservationRepository;

    @Override
    public TableLayoutResponse create(Long areaId, TableRequest request) {

        Area area = areaRepository.findById(areaId)
                .orElseThrow(() ->
                        new ResourceNotFoundException("Area not found"));

        RestaurantTable table = new RestaurantTable();
        table.setName(request.getName());
        table.setCapacity(request.getCapacity());
        table.setShape(request.getShape());
        table.setStatus(
                request.getStatus() != null
                        ? request.getStatus()
                        : ETableStatus.AVAILABLE
        );
        table.setArea(area);

        return map(tableRepository.save(table));
    }

    @Override
    public TableLayoutResponse update(Long id, TableRequest request) {

        RestaurantTable table = tableRepository.findById(id)
                .orElseThrow(() ->
                        new ResourceNotFoundException("Table not found"));

        table.setName(request.getName());
        table.setCapacity(request.getCapacity());
        table.setShape(request.getShape());
        table.setStatus(request.getStatus());

        return map(tableRepository.save(table));
    }

    @Override
    public void delete(Long id) {
        tableRepository.deleteById(id);
    }

    @Override
    public List<TableLayoutResponse> getTablesForReservation(LocalDate date, LocalTime startTime, Integer guestNumber) {
        LocalTime endTime = calculateReservationEndTime(startTime);
        LocalDateTime startDateTime = LocalDateTime.of(date, startTime);
        validateReservationTime(startDateTime);

        List<RestaurantTable> candidates = tableRepository.findByCapacityGreaterThanEqualAndStatusNotOrderByCapacityAsc(guestNumber, ETableStatus.UNAVAILABLE);

        if (candidates.isEmpty()) {
            return List.of();
        }

        List<EReservationStatus> blockingStatuses = List.of(EReservationStatus.PENDING, EReservationStatus.CONFIRMED, EReservationStatus.CHECKED_IN);

        LocalDateTime now = LocalDateTime.now();
        List<Long> reservedIds = reservationRepository.findReservedTableIds(date, startTime, endTime, blockingStatuses, now);

        Set<Long> reservedSet = new HashSet<>(reservedIds);

        return candidates.stream().filter(t -> !reservedSet.contains(t.getId())).map(this::map).toList();
    }

    private LocalTime calculateReservationEndTime(LocalTime startTime) {
        return startTime.plusHours(DEFAULT_RESERVATION_DURATION_HOURS);
    }

    @Override
    public List<RestaurantTableResponse> getAllTables() {
        List<RestaurantTable> tables = tableRepository.findAll();

        return tables.stream().map(this::toResponse).toList();
    }

    @Override
    public RestaurantTableResponse updateTableStatus(Long id, ETableStatus status) {
        RestaurantTable table = tableRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Table not found"));

        table.setStatus(status);
        tableRepository.save(table);
        log.info("Table id {} updated successfully to status {}", id, status);

        return toResponse(table);
    }

    private RestaurantTableResponse toResponse(RestaurantTable restaurantTable) {
        RestaurantTableResponse response = new RestaurantTableResponse();
        BeanUtils.copyProperties(restaurantTable, response);
        response.setId(restaurantTable.getId());
        return response;
    }

    private void validateReservationTime(LocalDateTime startDateTime) {
        if (startDateTime.isBefore(LocalDateTime.now())) {
            throw new InvalidDataException("Ngày giờ bắt đầu phải sau hiện tại");
        }

        if (startDateTime.toLocalTime().isBefore(OPEN_TIME)) {
            throw new InvalidDataException("Giờ bắt đầu phải sau giờ mở cửa của nhà hàng");
        }
    }

    private TableLayoutResponse map(RestaurantTable table) {
        TableLayoutResponse dto = new TableLayoutResponse();
        dto.setId(table.getId());
        dto.setName(table.getName());
        dto.setShape(table.getShape());
        dto.setStatus(table.getStatus());
        dto.setX(table.getPositionX());
        dto.setY(table.getPositionY());
        dto.setWidth(table.getWidth());
        dto.setHeight(table.getHeight());
        dto.setRotation(table.getRotation());
        dto.setCapacity(table.getCapacity());
        return dto;
    }
}
