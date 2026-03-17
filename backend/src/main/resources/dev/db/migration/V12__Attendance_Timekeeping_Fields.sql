-- Add timekeeping fields to attendances
ALTER TABLE attendances
    ADD COLUMN user_id BIGINT NULL AFTER work_schedule_id,
    ADD COLUMN status VARCHAR(50) NULL,
    ADD COLUMN attendance_type VARCHAR(50) NULL;

ALTER TABLE attendances
    ADD CONSTRAINT fk_attendances_user_id_users FOREIGN KEY (user_id) REFERENCES users (id);

-- Backfill user_id from work_schedules
UPDATE attendances a
JOIN work_schedules ws ON a.work_schedule_id = ws.id
SET a.user_id = ws.staff_id;

CREATE INDEX idx_attendances_user_id ON attendances (user_id);
CREATE INDEX idx_attendances_work_schedule_id ON attendances (work_schedule_id);

-- Thêm cột repeat_group_id vào bảng work_schedules
ALTER TABLE work_schedules
    ADD COLUMN repeat_group_id VARCHAR(255) NULL;

-- Tạo index để sau này xóa/truy vấn theo nhóm nhanh hơn
CREATE INDEX idx_repeat_group ON work_schedules(repeat_group_id);
