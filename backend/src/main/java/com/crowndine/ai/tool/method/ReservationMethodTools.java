package com.crowndine.ai.tool.method;

import com.crowndine.ai.schema.request.AvailableTablesRequest;
import com.crowndine.ai.schema.request.ReservationDetailRequest;
import com.crowndine.ai.schema.request.ReservationListRequest;
import com.crowndine.ai.schema.response.AvailableTablesResponse;
import com.crowndine.ai.schema.response.ReservationDetailResponse;
import com.crowndine.ai.schema.response.ReservationListResponse;
import com.crowndine.ai.tool.AIToolNames;
import com.crowndine.common.enums.EReservationStatus;
import com.crowndine.dto.response.OrderDetailHistoryResponse;
import com.crowndine.dto.response.PageResponse;
import com.crowndine.dto.response.RestaurantTableResponse;
import com.crowndine.dto.response.ReservationResponse;
import com.crowndine.exception.InvalidDataException;
import com.crowndine.model.Reservation;
import com.crowndine.service.layout.RestaurantTableService;
import com.crowndine.service.reservation.ReservationService;
import org.springframework.ai.tool.annotation.Tool;
import org.springframework.stereotype.Component;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

@Component
public class ReservationMethodTools {

    private final ReservationService reservationService;
    private final RestaurantTableService restaurantTableService;

    public ReservationMethodTools(ReservationService reservationService, RestaurantTableService restaurantTableService) {
        this.reservationService = reservationService;
        this.restaurantTableService = restaurantTableService;
    }

    @Tool(name = AIToolNames.RESERVATION_LIST_TOOL,
            description = "Lay danh sach reservation cua CrownDine theo khoang ngay va trang thai. Dung tool nay khi Admin hoi ve danh sach dat ban, reservation hom nay, reservation da xac nhan, da check-in hoac can xem nhanh reservation.")
    public ReservationListResponse getReservations(ReservationListRequest request) {
        LocalDate fromDate = parseDate(request.fromDate(), LocalDate.now());
        LocalDate toDate = parseDate(request.toDate(), fromDate);
        EReservationStatus status = parseStatus(request.status());
        int page = normalizePage(request.page());
        int size = normalizeSize(request.size());

        PageResponse<ReservationResponse> reservationPage = reservationService.getAllReservations(fromDate, toDate, status, page, size);
        List<ReservationListResponse.ReservationSummary> reservations = reservationPage.getData().stream()
                .map(reservation -> new ReservationListResponse.ReservationSummary(
                        reservation.getId(),
                        reservation.getCode(),
                        reservation.getCustomerName(),
                        reservation.getDate(),
                        reservation.getStartTime(),
                        reservation.getGuestNumber(),
                        reservation.getTableName(),
                        reservation.getStatus() != null ? reservation.getStatus().name() : null,
                        reservation.getOrderId()
                ))
                .toList();

        return new ReservationListResponse(
                reservationPage.getPage(),
                reservationPage.getPageSize(),
                reservationPage.getTotalPages(),
                reservationPage.getTotalItems(),
                reservations
        );
    }

    @Tool(name = AIToolNames.RESERVATION_DETAIL_TOOL,
            description = "Lay chi tiet mot reservation theo reservationId hoac reservationCode. Dung tool nay khi Admin muon xem thong tin dat ban, trang thai, ban, order va cac mon da goi.")
    public ReservationDetailResponse getReservationDetail(ReservationDetailRequest request) {
        Reservation reservation = resolveReservation(request);
        OrderDetailHistoryResponse orderDetail = reservationService.getReservationOrderDetails(reservation.getId());

        List<ReservationDetailResponse.ReservationOrderItem> items = orderDetail.getItems() == null
                ? List.of()
                : orderDetail.getItems().stream()
                .map(item -> new ReservationDetailResponse.ReservationOrderItem(
                        item.getOrderDetailId(),
                        item.getName(),
                        item.getType(),
                        item.getQuantity(),
                        item.getTotalPrice()
                ))
                .toList();

        return new ReservationDetailResponse(
                reservation.getId(),
                reservation.getCode(),
                reservation.getUser() != null ? reservation.getUser().getFullName() : null,
                reservation.getUser() != null ? reservation.getUser().getPhone() : null,
                reservation.getUser() != null ? reservation.getUser().getEmail() : null,
                reservation.getDate(),
                reservation.getStartTime(),
                reservation.getEndTime(),
                reservation.getGuestNumber(),
                reservation.getTable() != null ? reservation.getTable().getName() : null,
                reservation.getStatus() != null ? reservation.getStatus().name() : null,
                orderDetail.getOrderId(),
                orderDetail.getFinalPrice(),
                orderDetail.getDepositAmount(),
                items
        );
    }

    @Tool(name = AIToolNames.AVAILABLE_TABLES_TOOL,
            description = "Tim cac ban con trong de dat ban theo ngay, gio bat dau va so luong khach. Dung tool nay khi Admin hoi ban trong hoac muon tu van chon ban phu hop.")
    public AvailableTablesResponse findAvailableTables(AvailableTablesRequest request) {
        LocalDate date = parseDate(request.date(), LocalDate.now());
        LocalTime startTime = request.startTime() == null || request.startTime().isBlank()
                ? LocalTime.of(18, 0)
                : LocalTime.parse(request.startTime().trim());
        int guestNumber = request.guestNumber() == null || request.guestNumber() < 1 ? 1 : request.guestNumber();

        List<RestaurantTableResponse> tables = restaurantTableService.getTablesForReservation(date, startTime, guestNumber)
                .stream()
                .map(table -> {
                    RestaurantTableResponse response = new RestaurantTableResponse();
                    response.setId(table.getId());
                    response.setName(table.getName());
                    response.setCapacity(table.getCapacity());
                    response.setStatus(table.getStatus());
                    response.setShape(table.getShape());
                    return response;
                })
                .toList();

        List<AvailableTablesResponse.AvailableTableSummary> summaries = tables.stream()
                .map(table -> new AvailableTablesResponse.AvailableTableSummary(
                        table.getId(),
                        table.getName(),
                        table.getCapacity(),
                        table.getStatus() != null ? table.getStatus().name() : null,
                        table.getShape() != null ? table.getShape().name() : null
                ))
                .toList();

        return new AvailableTablesResponse(
                date.toString(),
                startTime.toString(),
                guestNumber,
                summaries.size(),
                summaries
        );
    }

    private LocalDate parseDate(String value, LocalDate defaultValue) {
        if (value == null || value.isBlank()) {
            return defaultValue;
        }
        return LocalDate.parse(value.trim());
    }

    private EReservationStatus parseStatus(String value) {
        if (value == null || value.isBlank()) {
            return null;
        }
        return EReservationStatus.valueOf(value.trim().toUpperCase());
    }

    private int normalizePage(Integer page) {
        return page == null || page < 1 ? 1 : page;
    }

    private int normalizeSize(Integer size) {
        if (size == null || size < 1) {
            return 10;
        }
        return Math.min(size, 20);
    }

    private Reservation resolveReservation(ReservationDetailRequest request) {
        if (request.reservationId() != null) {
            return reservationService.getReservationById(request.reservationId());
        }

        if (request.reservationCode() != null && !request.reservationCode().isBlank()) {
            return reservationService.getReservationByCode(request.reservationCode().trim());
        }

        throw new InvalidDataException("Can cung cap reservationId hoac reservationCode");
    }
}
