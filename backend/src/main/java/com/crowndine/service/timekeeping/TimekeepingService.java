package com.crowndine.service.timekeeping;

import com.crowndine.dto.request.TimekeepingRecordRequest;
import com.crowndine.dto.response.*;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.time.LocalDate;
import java.util.List;

public interface TimekeepingService {

    /**
     * Lưu chấm công (tạo mới hoặc cập nhật theo work schedule).
     */
    void saveRecord(TimekeepingRecordRequest request);

    /**
     * Lịch sử chấm công của một nhân viên (có phân trang).
     */
    Page<TimekeepingHistoryItemResponse> getHistory(Long userId, Pageable pageable);

    /**
     * Bảng chấm công theo tuần: dữ liệu theo ca và theo ngày, có tìm kiếm nhân viên.
     * @param date bất kỳ ngày nào trong tuần (hoặc null = tuần hiện tại)
     * @param searchName tìm theo tên nhân viên (optional)
     */
    TimekeepingScheduleResponse getWeeklySchedule(LocalDate date, String searchName);

    /**
     * Legend trạng thái chấm công (Đúng giờ, Đi muộn/Về sớm, ...).
     */
    List<TimekeepingStatusLegendResponse> getStatusLegend();

    /**
     * Tổng hợp chấm công theo nhân viên trong một tuần (view "Xem theo nhân viên").
     */
    AttendanceSummaryResponse getAttendanceSummary(LocalDate date, String searchName);

    /**
     * Thông tin nhân viên + trạng thái chấm công hiện tại (cho modal header).
     */
    EmployeeTimekeepingInfoResponse getEmployeeTimekeepingInfo(Long userId);
}
