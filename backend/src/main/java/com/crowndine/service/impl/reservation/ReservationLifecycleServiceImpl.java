package com.crowndine.service.impl.reservation;

import com.crowndine.common.enums.EOrderStatus;
import com.crowndine.common.enums.EReservationStatus;
import com.crowndine.common.enums.ETableStatus;
import com.crowndine.dto.request.ReservationCreateRequest;
import com.crowndine.dto.request.ReservationUpdateTableRequest;
import com.crowndine.dto.response.ReservationCreateResponse;
import com.crowndine.exception.InvalidDataException;
import com.crowndine.exception.ResourceNotFoundException;
import com.crowndine.model.Order;
import com.crowndine.model.Reservation;
import com.crowndine.model.RestaurantTable;
import com.crowndine.model.User;
import com.crowndine.repository.ReservationRepository;
import com.crowndine.repository.RestaurantTableRepository;
import com.crowndine.repository.UserRepository;
import com.crowndine.service.order.OrderService;
import com.crowndine.service.reservation.ReservationAvailabilityService;
import com.crowndine.service.reservation.ReservationLifecycleService;
import com.crowndine.service.reservation.ReservationTimePolicy;
import com.crowndine.service.reservation.event.ReservationCancelledEvent;
import com.crowndine.service.reservation.event.ReservationConfirmedEvent;
import jakarta.validation.constraints.NotNull;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j(topic = "RESERVATION-LIFECYCLE-SERVICE")
public class ReservationLifecycleServiceImpl implements ReservationLifecycleService {
    private static final long HOLD_TABLE_MINUTES = 10;

    private final ReservationRepository reservationRepository;
    private final UserRepository userRepository;
    private final RestaurantTableRepository tableRepository;
    private final OrderService orderService;
    private final ReservationTimePolicy reservationTimePolicy;
    private final ReservationAvailabilityService reservationAvailabilityService;
    private final ApplicationEventPublisher eventPublisher;

    @Override
    @Transactional(rollbackFor = Exception.class)
    public ReservationCreateResponse createReservation(String username, ReservationCreateRequest request) {
        LocalDateTime startDateTime = reservationTimePolicy.toStartDateTime(request.getDate(), request.getStartTime());
        LocalDateTime endDateTime = reservationTimePolicy.calculatePlannedEndTime(startDateTime);
        reservationTimePolicy.validateStartTime(startDateTime);

        User user;
        if (request.getCustomerId() != null) {
            user = userRepository.findById(request.getCustomerId()).orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy khách hàng"));
        } else {
            user = getUserByUserName(username);
        }

        RestaurantTable table = tableRepository.findById(request.getTableId()).orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy bàn"));

        validateTableForReservation(table, request.getGuestNumber());

        reservationAvailabilityService.ensureTableAvailable(request.getDate(), request.getStartTime(), table.getId());

        Reservation reservation = new Reservation();
        reservation.setDate(request.getDate());
        reservation.setStartTime(request.getStartTime());
        reservation.setEndTime(endDateTime.toLocalTime());
        reservation.setCheckedOutAt(null);
        reservation.setGuestNumber(request.getGuestNumber());
        reservation.setNote(request.getNote());

        if (request.getStatus() != null) {
            try {
                reservation.setStatus(EReservationStatus.valueOf(request.getStatus()));
                if (reservation.getStatus() == EReservationStatus.CONFIRMED) {
                    reservation.setExpiratedAt(null);
                } else {
                    reservation.setExpiratedAt(LocalDateTime.now().plusMinutes(HOLD_TABLE_MINUTES));
                }
            } catch (IllegalArgumentException e) {
                reservation.setStatus(EReservationStatus.PENDING);
                reservation.setExpiratedAt(LocalDateTime.now().plusMinutes(HOLD_TABLE_MINUTES));
            }
        } else {
            reservation.setStatus(EReservationStatus.PENDING);
            reservation.setExpiratedAt(LocalDateTime.now().plusMinutes(HOLD_TABLE_MINUTES));
        }

        reservation.setUser(user);
        reservation.setCode(UUID.randomUUID().toString());
        reservation.setTable(table);

        Reservation saved = reservationRepository.save(reservation);
        log.info("Reservation has been saved with id: {}", saved.getId());

        ReservationCreateResponse response = new ReservationCreateResponse();
        response.setReservationId(saved.getId());
        response.setReservationCode(saved.getCode());
        return response;
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public void checkInReservation(Long reservationId, String username) {
        log.info("Checking in reservation id {} by user {}", reservationId, username);
        Reservation reservation = getReservationById(reservationId);
        getUserByUserName(username);

        if (reservation.getStatus() == EReservationStatus.CHECKED_IN) {
            throw new InvalidDataException("Đặt bàn này đã được check-in");
        }

        if (reservation.getStatus() != EReservationStatus.CONFIRMED) {
            throw new InvalidDataException("Chỉ có thể check-in đặt bàn ở trạng thái CONFIRMED");
        }

        reservation.setStatus(EReservationStatus.CHECKED_IN);
        reservationRepository.save(reservation);

        if (reservation.getOrder() != null) {
            Order confirmedOrder = orderService.confirmReservationOrder(reservation.getOrder());
            reservation.setOrder(confirmedOrder);
        }

        log.info("Reservation id {} has been checked in successfully", reservationId);
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public void cancelReservation(Long reservationId, String username) {
        log.info("Cancelling reservation id {} for user {}", reservationId, username);

        Reservation reservation = getReservationById(reservationId);
        User user = getUserByUserName(username);
        validateReservationForUser(reservation, user);

        if (reservation.getStatus() != EReservationStatus.PENDING && reservation.getStatus() != EReservationStatus.CONFIRMED) {
            throw new InvalidDataException("Không thể hủy đặt bàn ở trạng thái này");
        }

        cancelReservationWithStatus(reservation, EReservationStatus.CANCELLED);
        log.info("Reservation id {} has been cancelled", reservationId);
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public void cancelReservationByStaff(Long reservationId, String username) {
        log.info("Staff/Admin {} cancelling reservation id {}", username, reservationId);

        Reservation reservation = getReservationById(reservationId);
        getUserByUserName(username);

        if (reservation.getStatus() != EReservationStatus.PENDING && reservation.getStatus() != EReservationStatus.CONFIRMED) {
            throw new InvalidDataException("Chỉ có thể hủy đặt bàn ở trạng thái PENDING hoặc CONFIRMED");
        }

        cancelReservationWithStatus(reservation, EReservationStatus.CANCELLED);
        log.info("Reservation id {} has been cancelled by staff/admin", reservationId);
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public void markReservationNoShow(Long reservationId, String username) {
        log.info("Staff/Admin {} marking reservation id {} as no-show", username, reservationId);

        Reservation reservation = getReservationById(reservationId);
        getUserByUserName(username);

        if (reservation.getStatus() != EReservationStatus.CONFIRMED) {
            throw new InvalidDataException("Chỉ có thể đánh dấu no-show cho đặt bàn ở trạng thái CONFIRMED");
        }

        cancelReservationWithStatus(reservation, EReservationStatus.NO_SHOW);
        log.info("Reservation id {} has been marked as no-show", reservationId);
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public void completeReservation(Long reservationId, String username) {
        log.info("Staff/Admin {} completing reservation id {}", username, reservationId);

        Reservation reservation = getReservationById(reservationId);
        getUserByUserName(username);

        if (reservation.getStatus() != EReservationStatus.CHECKED_IN) {
            throw new InvalidDataException("Chỉ có thể hoàn thành đặt bàn ở trạng thái CHECKED_IN");
        }

        Order order = reservation.getOrder();
        if (order != null && order.getStatus() != EOrderStatus.COMPLETED) {
            throw new InvalidDataException("Chỉ có thể hoàn thành đặt bàn khi đơn hàng đã hoàn tất thanh toán");
        }

        reservation.setStatus(EReservationStatus.COMPLETED);
        reservation.setCheckedOutAt(LocalDateTime.now());
        reservation.setExpiratedAt(null);
        reservationRepository.save(reservation);

        log.info("Reservation id {} has been completed", reservationId);
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public void updateReservationTable(Long reservationId, ReservationUpdateTableRequest request, String username) {
        log.info("Updating table for reservation id {} to table id {} for user {}", reservationId, request.getTableId(), username);

        Reservation reservation = getReservationById(reservationId);
        User user = getUserByUserName(username);
        validateReservationForUser(reservation, user);

        if (reservation.getStatus() != EReservationStatus.PENDING) {
            throw new InvalidDataException("Chỉ có thể thay đổi bàn khi đặt bàn ở trạng thái PENDING");
        }

        RestaurantTable newTable = tableRepository.findById(request.getTableId()).orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy bàn"));

        validateTableForReservation(newTable, reservation.getGuestNumber());

        reservationAvailabilityService.ensureTableAvailable(reservation.getDate(), reservation.getStartTime(), newTable.getId(), reservation.getId());

        reservation.setTable(newTable);
        if (reservation.getOrder() != null) {
            reservation.getOrder().setRestaurantTable(newTable);
        }

        reservationRepository.save(reservation);
        log.info("Reservation id {} table updated to table id {}", reservationId, request.getTableId());
    }

    private void validateTableForReservation(RestaurantTable table, Integer guestNumber) {

        if (table.getStatus() == ETableStatus.UNAVAILABLE) {
            throw new InvalidDataException("Bàn không khả dụng");
        }

        if (table.getCapacity() != null && table.getCapacity() < guestNumber) {
            throw new InvalidDataException("Số lượng khách vượt quá sức chứa của bàn");
        }
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public void confirmAfterDepositPaid(Reservation reservation) {
        reservation.setStatus(EReservationStatus.CONFIRMED);
        reservation.setExpiratedAt(null);
        reservationRepository.save(reservation);
        eventPublisher.publishEvent(new ReservationConfirmedEvent(reservation.getId()));
        log.info("Reservation id {} status changed to {} and ReservationConfirmedEvent published", reservation.getId(), reservation.getStatus());
    }

    private Reservation getReservationById(Long reservationId) {
        return reservationRepository.findById(reservationId).orElseThrow(() -> new ResourceNotFoundException("Reservation not found"));
    }

    private User getUserByUserName(String username) {
        return userRepository.findByUsername(username).orElseThrow(() -> new ResourceNotFoundException("User not found"));
    }

    private void validateReservationForUser(Reservation reservation, User user) {
        if (reservation.getUser() == null || !reservation.getUser().getId().equals(user.getId())) {
            throw new InvalidDataException("Không có quyền thao tác đặt bàn này");
        }
    }

    private void cancelReservationWithStatus(Reservation reservation, EReservationStatus targetStatus) {
        reservation.setStatus(targetStatus);
        reservation.setCheckedOutAt(null);
        reservation.setExpiratedAt(null);
        reservationRepository.save(reservation);
        eventPublisher.publishEvent(new ReservationCancelledEvent(
                reservation.getId(),
                reservation.getOrder() != null ? reservation.getOrder().getId() : null
        ));
    }
}
