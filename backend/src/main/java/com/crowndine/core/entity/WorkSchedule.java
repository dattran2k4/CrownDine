package com.crowndine.core.entity;

import com.crowndine.common.enums.EWorkScheduleStatus;
import jakarta.persistence.*;
import jakarta.persistence.Table;
import lombok.*;

import java.time.LocalDate;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "work_schedules")
public class WorkSchedule extends AbstractEntity<Long> {

    @Column(name = "work_date", nullable = false)
    private LocalDate workDate;

    @Enumerated(EnumType.STRING)
    @Column(name = "status")
    private EWorkScheduleStatus status;

    @Column(name = "note")
    private String note;

    @Column(name = "repeat_group_id")
    private String repeatGroupId; // Null nếu là ca đơn lẻ, có giá trị nếu là ca lặp lại

    @Column(name = "is_repeated")
    private Boolean isRepeated; // Đánh dấu đây là bản gốc lặp lại để nội suy

    @Column(name = "end_date")
    private LocalDate endDate;

    @Column(name = "days_of_week")
    private String daysOfWeek; // VD: "1,3,5"

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "shift_id")
    private Shift shift;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "staff_id")
    private User staff;

}
