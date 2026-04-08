package com.crowndine.presentation.dto.response;

import com.crowndine.common.enums.EReservationStatus;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

@Getter
@Setter
public class ReservationResponse {
    private Long id;
    private String code;
    private String customerName;
    private String guestName;
    private String createdByStaffName;
    private String phone;
    private String email;
    private LocalDate date;
    private LocalTime startTime;
    private LocalTime endTime;
    private Integer guestNumber;
    private String tableName;
    private String note;
    private EReservationStatus status;
    private Long orderId;
    private List<OrderDetailResponse> orderDetails;
    private String floorName;
    private String areaName;
}
