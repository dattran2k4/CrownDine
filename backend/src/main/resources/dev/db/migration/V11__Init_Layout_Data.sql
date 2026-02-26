-- =========================================================================
-- Flyway Migration V11
-- Populate Initial Data for Floor, Area, and Table Coordinates
-- =========================================================================

-- 1. Thêm Tầng (Floors)
INSERT INTO `floors` (`name`, `floor_number`, `description`, `created_at`, `updated_at`)
VALUES 
('Tầng 1', 1, 'Khu vực trong nhà chính và phòng VIP', NOW(), NOW()),
('Tầng 2', 2, 'Khu vực ngoài trời và sân thượng', NOW(), NOW());


-- 2. Thêm Khu Vực (Areas)
-- Tầng 1 (floor_id = 1)
INSERT INTO `areas` (`name`, `description`, `floor_id`, `x`, `y`, `width`, `height`, `created_at`, `updated_at`)
VALUES 
('Sảnh chính', 'Khu vực ăn uống chung rộng rãi', 1, 50, 50, 600, 400, NOW(), NOW()),
('Phòng VIP 1', 'Phòng riêng tư cho 10-12 người', 1, 700, 50, 300, 200, NOW(), NOW()),
('Phòng VIP 2', 'Phòng tụ họp gia đình', 1, 700, 300, 300, 150, NOW(), NOW());

-- Tầng 2 (floor_id = 2)
INSERT INTO `areas` (`name`, `description`, `floor_id`, `x`, `y`, `width`, `height`, `created_at`, `updated_at`)
VALUES 
('Sân thượng', 'Khu vực ngoài trời thoáng mát', 2, 50, 50, 500, 400, NOW(), NOW()),
('Ban công BBQ', 'Khu chuyên nướng BBQ', 2, 600, 50, 400, 400, NOW(), NOW());

-- 3. Cập nhật vị trí và kích thước cho các Bàn đã có từ V2 (1, 2, 3, 4)
-- Gán hết vào "Sảnh chính" (area_id = 1)
UPDATE `restaurant_tables` 
SET `area_id` = 1, `shape` = 'RECT', `width` = 100, `height` = 60, `position_x` = 100, `position_y` = 100, `rotation` = 0
WHERE `id` = 1;

UPDATE `restaurant_tables` 
SET `area_id` = 1, `shape` = 'RECT', `width` = 100, `height` = 60, `position_x` = 250, `position_y` = 100, `rotation` = 0
WHERE `id` = 2;

UPDATE `restaurant_tables` 
SET `area_id` = 1, `shape` = 'RECT', `width` = 120, `height` = 80, `position_x` = 100, `position_y` = 250, `rotation` = 0
WHERE `id` = 3;

UPDATE `restaurant_tables` 
SET `area_id` = 1, `shape` = 'CIRCLE', `width` = 100, `height` = 100, `position_x` = 300, `position_y` = 250, `rotation` = 0
WHERE `id` = 4;

-- 4. Thêm một số bàn mới hoàn toàn cho các Khu Vực khác để Sơ đồ sinh động hơn
INSERT INTO `restaurant_tables` 
(`name`, `capacity`, `status`, `base_deposit`, `position_x`, `position_y`, `width`, `height`, `rotation`, `shape`, `area_id`, `created_at`, `updated_at`)
VALUES
-- VIP 1 (Area 2)
('VIP-1-01', 12, 'AVAILABLE', 500000.00, 150, 100, 200, 100, 0, 'RECT', 2, NOW(), NOW()),

-- VIP 2 (Area 3)
('VIP-2-01', 8, 'AVAILABLE', 200000.00, 150, 100, 150, 150, 0, 'CIRCLE', 3, NOW(), NOW()),

-- Sân thượng (Area 4)
('Bàn T2-01', 4, 'AVAILABLE', 0.00, 100, 100, 80,  80,  0, 'RECT', 4, NOW(), NOW()),
('Bàn T2-02', 4, 'AVAILABLE', 0.00, 250, 100, 80,  80,  0, 'RECT', 4, NOW(), NOW()),
('Bàn T2-03', 2, 'AVAILABLE', 0.00, 100, 250, 60,  60,  0, 'CIRCLE',    4, NOW(), NOW()),
('Bàn T2-04', 2, 'AVAILABLE', 0.00, 250, 250, 60,  60,  0, 'CIRCLE',    4, NOW(), NOW());
