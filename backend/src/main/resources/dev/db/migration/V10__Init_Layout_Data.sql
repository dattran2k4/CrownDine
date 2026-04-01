-- =========================================================================
-- Flyway Migration V11
-- Populate Initial Data for Floor, Area, and Table Coordinates
-- =========================================================================

-- 1. Thêm Tầng (Floors)
INSERT INTO `floors` (`name`, `floor_number`, `description`, `created_at`, `updated_at`)
VALUES 
('Tầng 1', 1, 'Khu vực trong nhà chính và phòng VIP', NOW(), NOW()),
('Tầng 2', 2, 'Khu vực ngoài trời và sân thượng', NOW(), NOW());


-- 2. Thêm Khu Vực (Areas) - Tránh overlap, canh chỉnh perfect margin
-- Tầng 1 (floor_id = 1)
INSERT INTO `areas` (`name`, `description`, `floor_id`, `x`, `y`, `width`, `height`, `created_at`, `updated_at`)
VALUES 
('Sảnh chính', 'Khu vực ăn uống chung rộng rãi', 1, 50, 50, 1100, 500, NOW(), NOW()),
('Phòng VIP 1', 'Phòng riêng cho 10 người', 1, 50, 600, 525, 250, NOW(), NOW()),
('Phòng VIP 2', 'Phòng tụ họp gia đình', 1, 625, 600, 525, 250, NOW(), NOW());

-- Tầng 2 (floor_id = 2)
INSERT INTO `areas` (`name`, `description`, `floor_id`, `x`, `y`, `width`, `height`, `created_at`, `updated_at`)
VALUES 
('Sân thượng', 'Khu vực ngoài trời thoáng mát', 2, 50, 50, 1100, 500, NOW(), NOW()),
('Ban công BBQ', 'Khu chuyên nướng BBQ', 2, 50, 600, 1100, 500, NOW(), NOW());

-- 3. Thêm Bàn (Tables)
INSERT INTO `restaurant_tables` 
(`name`, `capacity`, `status`, `base_deposit`, `position_x`, `position_y`, `width`, `height`, `rotation`, `shape`, `area_id`, `created_at`, `updated_at`)
VALUES
-- Area 1: Sảnh chính (1100x500) - 8 bàn. 6 SQUARE (90x90), 2 RECT (200x90). Khoảng cách xa tít.
('SC-1', 6, 'AVAILABLE', 0.00, 155, 80, 90, 90, 0, 'SQUARE', 1, NOW(), NOW()),
('SC-2', 6, 'AVAILABLE', 0.00, 505, 80, 90, 90, 0, 'SQUARE', 1, NOW(), NOW()),
('SC-3', 6, 'AVAILABLE', 0.00, 855, 80, 90, 90, 0, 'SQUARE', 1, NOW(), NOW()),

('SC-7', 10, 'AVAILABLE', 0.00, 275, 205, 200, 90, 0, 'RECT', 1, NOW(), NOW()),
('SC-8', 10, 'AVAILABLE', 0.00, 625, 205, 200, 90, 0, 'RECT', 1, NOW(), NOW()),

('SC-4', 6, 'AVAILABLE', 0.00, 155, 330, 90, 90, 0, 'SQUARE', 1, NOW(), NOW()),
('SC-5', 6, 'AVAILABLE', 0.00, 505, 330, 90, 90, 0, 'SQUARE', 1, NOW(), NOW()),
('SC-6', 6, 'AVAILABLE', 0.00, 855, 330, 90, 90, 0, 'SQUARE', 1, NOW(), NOW()),

-- Area 2: Phòng VIP 1 (525x250) - 1 bàn RECT (200x90)
('VIP1-1', 10, 'AVAILABLE', 500000.00, 162, 80, 200, 90, 0, 'RECT', 2, NOW(), NOW()),

-- Area 3: Phòng VIP 2 (525x250) - 2 bàn CIRCLE (80x80)
('VIP2-1', 8, 'AVAILABLE', 200000.00, 140, 85, 80, 80, 0, 'CIRCLE', 3, NOW(), NOW()),
('VIP2-2', 8, 'AVAILABLE', 200000.00, 305, 85, 80, 80, 0, 'CIRCLE', 3, NOW(), NOW()),

-- Area 4: Sân thượng (1100x500) - 6 bàn SQUARE (90x90)
('T2-1', 6, 'AVAILABLE', 0.00, 155, 100, 90, 90, 0, 'SQUARE', 4, NOW(), NOW()),
('T2-2', 6, 'AVAILABLE', 0.00, 505, 100, 90, 90, 0, 'SQUARE', 4, NOW(), NOW()),
('T2-3', 6, 'AVAILABLE', 0.00, 855, 100, 90, 90, 0, 'SQUARE', 4, NOW(), NOW()),
('T2-4', 6, 'AVAILABLE', 0.00, 155, 310, 90, 90, 0, 'SQUARE', 4, NOW(), NOW()),
('T2-5', 6, 'AVAILABLE', 0.00, 505, 310, 90, 90, 0, 'SQUARE', 4, NOW(), NOW()),
('T2-6', 6, 'AVAILABLE', 0.00, 855, 310, 90, 90, 0, 'SQUARE', 4, NOW(), NOW()),

-- Area 5: Ban công BBQ (1100x500) - 9 bàn CIRCLE (80x80)
('BBQ-2', 8, 'AVAILABLE', 0.00, 190, 60,  80, 80, 0, 'CIRCLE', 5, NOW(), NOW()),
('BBQ-3', 8, 'AVAILABLE', 0.00, 510, 60,  80, 80, 0, 'CIRCLE', 5, NOW(), NOW()),
('BBQ-4', 8, 'AVAILABLE', 0.00, 830, 60,  80, 80, 0, 'CIRCLE', 5, NOW(), NOW()),

('BBQ-5', 8, 'AVAILABLE', 0.00, 190, 210, 80, 80, 0, 'CIRCLE', 5, NOW(), NOW()),
('BBQ-1', 8, 'AVAILABLE', 0.00, 510, 210, 80, 80, 0, 'CIRCLE', 5, NOW(), NOW()),
('BBQ-9', 8, 'AVAILABLE', 0.00, 830, 210, 80, 80, 0, 'CIRCLE', 5, NOW(), NOW()),

('BBQ-6', 8, 'AVAILABLE', 0.00, 190, 360, 80, 80, 0, 'CIRCLE', 5, NOW(), NOW()),
('BBQ-7', 8, 'AVAILABLE', 0.00, 510, 360, 80, 80, 0, 'CIRCLE', 5, NOW(), NOW()),
('BBQ-8', 8, 'AVAILABLE', 0.00, 830, 360, 80, 80, 0, 'CIRCLE', 5, NOW(), NOW());
