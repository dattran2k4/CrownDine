package com.crowndine.ai.tool.method;

import com.crowndine.ai.schema.request.ReservationListRequest;
import com.crowndine.ai.schema.response.ReservationListResponse;
import com.crowndine.ai.tool.AIToolNames;
import com.crowndine.common.enums.EReservationStatus;
import com.crowndine.dto.response.PageResponse;
import com.crowndine.dto.response.ReservationResponse;
import com.crowndine.service.reservation.ReservationService;
import org.springframework.ai.tool.annotation.Tool;
import org.springframework.stereotype.Component;

import java.time.LocalDate;
import java.util.List;

@Component
public class ReservationMethodTools {

    private final ReservationService reservationService;

    public ReservationMethodTools(ReservationService reservationService) {
        this.reservationService = reservationService;
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
}
