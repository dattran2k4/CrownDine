package com.crowndine.model;

import com.crowndine.common.enums.EWorkScheduleStatus;
import jakarta.persistence.*;
import jakarta.persistence.Table;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "work_schedules")
public class WorkSchedule extends AbstractEntity<Long> {

    @Enumerated(EnumType.STRING)
    @Column(name = "status")
    private EWorkScheduleStatus status;

    @ManyToOne
    @JoinColumn(name = "shift_id")
    private Shift shift;

    @ManyToOne
    @JoinColumn(name = "staff_id")
    private User staff;

}
