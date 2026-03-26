package com.crowndine.service.impl.reservation;

import com.crowndine.common.enums.EOrderStatus;
import com.crowndine.common.enums.EReservationStatus;
import com.crowndine.common.enums.ETableStatus;
import com.crowndine.dto.response.RestaurantTableResponse;
import com.crowndine.model.Reservation;
import com.crowndine.model.RestaurantTable;
import com.crowndine.repository.ReservationRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.BeanUtils;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j(topic = "RESERVATION-TABLE-RESERVE-SCHEDULER")
public class ReservationTableReserveScheduler {

    private static final long LEAD_HOURS = 1;
    private static final long WINDOW_MINUTES = 10;

    private final ReservationRepository reservationRepository;
    private final SimpMessagingTemplate messagingTemplate;

    @Scheduled(fixedRate = 300000)
    @Transactional(rollbackFor = Exception.class)
    public void reserveTablesForUpcomingReservations() {
        LocalDateTime now = LocalDateTime.now();
        LocalDateTime windowStart = now.plusHours(LEAD_HOURS);
        LocalDateTime windowEnd = windowStart.plusMinutes(WINDOW_MINUTES);

        List<Reservation> candidates = reservationRepository.findTableReserveCandidates(EReservationStatus.CONFIRMED, EOrderStatus.PRE_ORDER, ETableStatus.AVAILABLE, now.toLocalDate(), windowStart.toLocalTime(), windowEnd.toLocalTime());

        long updatedCount = candidates.stream()
                .filter(this::reserveTable)
                .count();

        if (updatedCount > 0) {
            log.info("Reserved {} tables for upcoming confirmed reservations with pre-orders", updatedCount);
        }
    }

    private boolean reserveTable(Reservation reservation) {
        RestaurantTable table = reservation.getTable();
        table.setStatus(ETableStatus.RESERVED);
        notifyTableUpdated(table);
        log.info("Set table {} to RESERVED for reservation {}", table.getId(), reservation.getId());
        return true;
    }

    private void notifyTableUpdated(RestaurantTable table) {
        RestaurantTableResponse tableResponse = new RestaurantTableResponse();
        BeanUtils.copyProperties(table, tableResponse);
        tableResponse.setId(table.getId());
        messagingTemplate.convertAndSend("/topic/tables", tableResponse);
    }
}
