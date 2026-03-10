-- Add timekeeping fields to attendances
ALTER TABLE attendances
    ADD COLUMN user_id BIGINT NULL AFTER work_schedule_id,
    ADD COLUMN status VARCHAR(50) NULL,
    ADD COLUMN attendance_type VARCHAR(50) NULL,
    ADD COLUMN method VARCHAR(50) NULL;

ALTER TABLE attendances
    ADD CONSTRAINT fk_attendances_user_id_users FOREIGN KEY (user_id) REFERENCES users (id);

-- Backfill user_id from work_schedules
UPDATE attendances a
JOIN work_schedules ws ON a.work_schedule_id = ws.id
SET a.user_id = ws.staff_id;

CREATE INDEX idx_attendances_user_id ON attendances (user_id);
CREATE INDEX idx_attendances_work_schedule_id ON attendances (work_schedule_id);
