package com.crowndine.model;

import com.crowndine.common.enums.EAttendanceMethod;
import com.crowndine.common.enums.EAttendanceStatus;
import com.crowndine.common.enums.EAttendanceType;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "attendances")
public class Attendance extends AbstractEntity<Long> {

    @Column(name = "check_in_at")
    private LocalDateTime checkInAt;

    @Column(name = "check_out_at")
    private LocalDateTime checkOutAt;

    @Column(name = "note", length = 500)
    private String note;

    @Enumerated(EnumType.STRING)
    @Column(name = "status")
    private EAttendanceStatus status;

    @Enumerated(EnumType.STRING)
    @Column(name = "attendance_type")
    private EAttendanceType attendanceType;

    @Enumerated(EnumType.STRING)
    @Column(name = "method")
    private EAttendanceMethod method;

    @OneToOne
    @JoinColumn(name = "work_schedule_id")
    private WorkSchedule workSchedule;

    @ManyToOne
    @JoinColumn(name = "user_id")
    private User user;
}
