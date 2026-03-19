package com.crowndine.service.impl.reservation;

import com.crowndine.common.enums.EReservationStatus;
import com.crowndine.exception.InvalidDataException;
import com.crowndine.model.Reservation;
import com.crowndine.repository.ReservationRepository;
import com.crowndine.service.reservation.ReservationAvailabilityService;
import com.crowndine.service.reservation.ReservationOverlapService;
import com.crowndine.service.reservation.ReservationTimePolicy;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.HashSet;
import java.util.List;
import java.util.Objects;
import java.util.Set;

@Service
@RequiredArgsConstructor
@Slf4j(topic = "RESERVATION-AVAILABILITY-SERVICE")
public class ReservationAvailabilityServiceImpl implements ReservationAvailabilityService {
    private static final List<EReservationStatus> BLOCKING_STATUSES = List.of(EReservationStatus.PENDING, EReservationStatus.CONFIRMED, EReservationStatus.CHECKED_IN);

    private final ReservationRepository reservationRepository;
    private final ReservationTimePolicy reservationTimePolicy;
    private final ReservationOverlapService reservationOverlapService;

    /**
     * Gom các bàn đang bị reservation khác chặn lại.
     */
    @Override
    public Set<Long> findBlockedTableIds(LocalDate date, LocalTime startTime, List<Long> tableIds) {
        if (tableIds == null || tableIds.isEmpty()) {
            return Set.of();
        }

        LocalDateTime requestedStartDateTime = reservationTimePolicy.toStartDateTime(date, startTime);
        List<Reservation> blockingReservations = findBlockingReservations(date, tableIds);

        Set<Long> blockedTableIds = new HashSet<>();
        for (Reservation reservation : blockingReservations) {
            if (reservationOverlapService.isBlockingReservation(reservation, requestedStartDateTime)) {
                blockedTableIds.add(reservation.getTable().getId());
            }
        }

        return blockedTableIds;
    }

    @Override
    public void ensureTableAvailable(LocalDate date, LocalTime startTime, Long tableId) {
        ensureTableAvailable(date, startTime, tableId, null);
    }

    /**
     * Ném lỗi khi bàn đã bị reservation khác chặn.
     */
    @Override
    public void ensureTableAvailable(LocalDate date, LocalTime startTime, Long tableId, Long excludedReservationId) {
        LocalDateTime requestedStartDateTime = reservationTimePolicy.toStartDateTime(date, startTime);
        List<Reservation> blockingReservations = findBlockingReservations(date, List.of(tableId));

        for (Reservation reservation : blockingReservations) {
            if (isBlockingReservationForTable(reservation, tableId, excludedReservationId, requestedStartDateTime)) {
                log.info("Table id {} is blocked by reservation id {}", tableId, reservation.getId());
                throw new InvalidDataException("Bàn đã được đặt trong khung giờ này");
            }
        }
    }

    private List<Reservation> findBlockingReservations(LocalDate date, List<Long> tableIds) {
        return reservationRepository.findBlockingReservations(date, tableIds, BLOCKING_STATUSES, LocalDateTime.now());
    }

    /**
     * Kiểm tra reservation hiện tại có đang chặn đúng bàn cần kiểm tra hay không.
     */
    private boolean isBlockingReservationForTable(Reservation reservation, Long tableId, Long excludedReservationId, LocalDateTime requestedStartDateTime) {
        boolean isSameTable = Objects.equals(reservation.getTable().getId(), tableId);
        boolean isExcludedReservation = Objects.equals(reservation.getId(), excludedReservationId);

        return isSameTable && !isExcludedReservation && reservationOverlapService.isBlockingReservation(reservation, requestedStartDateTime);
    }
}
