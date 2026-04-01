package com.crowndine.service.impl.reservation;

import com.crowndine.common.enums.EOrderStatus;
import com.crowndine.common.enums.EReservationStatus;
import com.crowndine.common.enums.ETableStatus;
import com.crowndine.common.enums.ERole;
import com.crowndine.common.utils.CodeUtils;
import com.crowndine.dto.request.ReservationCreateRequest;
import com.crowndine.dto.request.StaffReservationCreateRequest;
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
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

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
    public ReservationCreateResponse createReservationByCustomer(String username, ReservationCreateRequest request) {
        LocalDateTime startDateTime = reservationTimePolicy.toStartDateTime(request.getDate(), request.getStartTime());
        User customer = getUserByUserName(username);
        return createReservationInternal(request, customer, null, null, null, EReservationStatus.PENDING, startDateTime);
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public ReservationCreateResponse createWalkInReservationByStaff(String staffUsername, StaffReservationCreateRequest request) {
        LocalDateTime startDateTime = reservationTimePolicy.toStartDateTime(request.getDate(), request.getStartTime());
        User staff = getUserByUserName(staffUsername);

        return createReservationInternal(request, null, staff, request.getGuestName().trim(), request.getGuestPhone(), EReservationStatus.CONFIRMED, startDateTime);
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public void checkInReservation(Long reservationId, String username) {
        log.info("Checking in reservation id {} by user {}", reservationId, username);
        Reservation reservation = getReservationById(reservationId);
        getUserByUserName(username);

        if (reservation.getStatus() == EReservationStatus.CHECKED_IN) {
            throw new InvalidDataException("reservation.already_checked_in");
        }

        if (reservation.getStatus() != EReservationStatus.CONFIRMED) {
            throw new InvalidDataException("reservation.check_in_only_confirmed");
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
            throw new InvalidDataException("reservation.cancel_invalid_state");
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
            throw new InvalidDataException("reservation.cancel_only_pending_or_confirmed");
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
            throw new InvalidDataException("reservation.no_show_only_confirmed");
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
            throw new InvalidDataException("reservation.complete_only_checked_in");
        }

        Order order = reservation.getOrder();
        if (order != null && order.getStatus() != EOrderStatus.COMPLETED) {
            throw new InvalidDataException("reservation.complete_requires_paid_order");
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
            throw new InvalidDataException("reservation.update_table_only_pending");
        }

        RestaurantTable newTable = tableRepository.findById(request.getTableId()).orElseThrow(() -> new ResourceNotFoundException("table.not_found"));

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
            throw new InvalidDataException("reservation.table_unavailable");
        }

        if (table.getCapacity() != null && table.getCapacity() < guestNumber) {
            throw new InvalidDataException("reservation.table_capacity_exceeded");
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
        return reservationRepository.findById(reservationId).orElseThrow(() -> new ResourceNotFoundException("reservation.not_found"));
    }

    private User getUserByUserName(String username) {
        return userRepository.findByUsername(username).orElseThrow(() -> new ResourceNotFoundException("user.not_found"));
    }

    private void validateReservationForUser(Reservation reservation, User user) {
        boolean isOwner = reservation.getUser() != null && reservation.getUser().getId().equals(user.getId());
        boolean hasPrivilege = user.getRoles().stream()
                .anyMatch(role -> role.getName() == ERole.STAFF || role.getName() == ERole.ADMIN);

        if (!isOwner && !hasPrivilege) {
            throw new InvalidDataException("reservation.access_denied");
        }
    }

    private ReservationCreateResponse createReservationInternal(ReservationCreateRequest request, User customer,
                                                                User createdByStaff, String guestName, String guestPhone,
                                                                EReservationStatus initialStatus, LocalDateTime startDateTime) {
        LocalDateTime endDateTime = reservationTimePolicy.calculatePlannedEndTime(startDateTime);
        reservationTimePolicy.validateStartTime(startDateTime);

        RestaurantTable table = tableRepository.findById(request.getTableId()).orElseThrow(() -> new ResourceNotFoundException("table.not_found"));

        validateTableForReservation(table, request.getGuestNumber());
        reservationAvailabilityService.ensureTableAvailable(request.getDate(), request.getStartTime(), table.getId());

        Reservation reservation = new Reservation();
        reservation.setDate(request.getDate());
        reservation.setStartTime(request.getStartTime());
        reservation.setEndTime(endDateTime.toLocalTime());
        reservation.setCheckedOutAt(null);
        reservation.setGuestNumber(request.getGuestNumber());
        reservation.setNote(request.getNote());
        reservation.setUser(customer);
        reservation.setCreatedByStaff(createdByStaff);
        reservation.setGuestName(guestName);
        reservation.setGuestPhone(guestPhone);
        reservation.setCode(CodeUtils.generateReservationCode());
        reservation.setTable(table);
        applyInitialStatus(reservation, initialStatus);

        Reservation saved = reservationRepository.save(reservation);
        log.info("Reservation has been saved with id: {}", saved.getId());

        ReservationCreateResponse response = new ReservationCreateResponse();
        response.setReservationId(saved.getId());
        response.setReservationCode(saved.getCode());
        return response;
    }

    private void applyInitialStatus(Reservation reservation, EReservationStatus initialStatus) {
        reservation.setStatus(initialStatus);
        if (initialStatus == EReservationStatus.CONFIRMED) {
            reservation.setExpiratedAt(null);
            return;
        }

        reservation.setExpiratedAt(LocalDateTime.now().plusMinutes(HOLD_TABLE_MINUTES));
    }

    private void cancelReservationWithStatus(Reservation reservation, EReservationStatus targetStatus) {
        reservation.setStatus(targetStatus);
        reservation.setCheckedOutAt(null);
        reservation.setExpiratedAt(null);
        reservationRepository.save(reservation);
        eventPublisher.publishEvent(new ReservationCancelledEvent(reservation.getId(), reservation.getOrder() != null ? reservation.getOrder().getId() : null));
    }
}
