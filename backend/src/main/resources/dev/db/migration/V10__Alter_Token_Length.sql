-- 1. Xóa ràng buộc Unique đang chặn việc dùng TEXT
ALTER TABLE `tokens` DROP INDEX `UKna3v9f8s7ucnj16tylrs822qj`;

-- 2. Chuyển sang TEXT để lưu JWT thoải mái
ALTER TABLE `tokens` MODIFY COLUMN `token` TEXT NOT NULL;