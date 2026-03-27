package com.crowndine.service.impl.layout;

import com.crowndine.common.enums.ETableStatus;
import com.crowndine.dto.response.RestaurantTableResponse;
import com.crowndine.exception.ResourceNotFoundException;
import com.crowndine.model.RestaurantTable;
import com.crowndine.repository.RestaurantTableRepository;
import com.crowndine.service.layout.RestaurantTableStateService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.BeanUtils;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Slf4j(topic = "RESTAURANT-TABLE-STATE-SERVICE")
public class RestaurantTableStateServiceImpl implements RestaurantTableStateService {

    private final RestaurantTableRepository tableRepository;
    private final SimpMessagingTemplate messagingTemplate;

    @Override
    @Transactional(rollbackFor = Exception.class)
    public void markAvailable(Long tableId) {
        changeStatus(tableId, ETableStatus.AVAILABLE);
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public void markReserved(Long tableId) {
        changeStatus(tableId, ETableStatus.RESERVED);
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public void markOccupied(Long tableId) {
        changeStatus(tableId, ETableStatus.OCCUPIED);
    }

    private void changeStatus(Long tableId, ETableStatus targetStatus) {
        RestaurantTable table = tableRepository.findById(tableId)
                .orElseThrow(() -> new ResourceNotFoundException("Table not found"));

        if (table.getStatus() == targetStatus) {
            return;
        }

        table.setStatus(targetStatus);
        tableRepository.save(table);

        RestaurantTableResponse response = new RestaurantTableResponse();
        BeanUtils.copyProperties(table, response);
        response.setId(table.getId());
        messagingTemplate.convertAndSend("/topic/tables", response);

        log.info("Updated table {} to {}", tableId, targetStatus);
    }
}
