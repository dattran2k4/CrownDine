-- Thêm cột repeat_group_id vào bảng work_schedules
ALTER TABLE work_schedules
    ADD COLUMN repeat_group_id VARCHAR(36) NULL;

-- Tạo index để sau này xóa/truy vấn theo nhóm nhanh hơn
CREATE INDEX idx_repeat_group ON work_schedules(repeat_group_id);