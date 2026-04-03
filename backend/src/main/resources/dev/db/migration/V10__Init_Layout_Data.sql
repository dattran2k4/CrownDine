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
('Sảnh chính', 'Khu vực ăn uống chung rộng rãi', 1, 420, 275, 410, 250, NOW(), NOW()),
('Phòng VIP 1', 'Phòng riêng cho 10 người', 1, 416, 100, 200, 150, NOW(), NOW()),
('Phòng VIP 2', 'Phòng tụ họp gia đình', 1, 630, 100, 200, 150, NOW(), NOW()),
('Phòng VIP 3', '', 1, 850, 275, 200, 250, NOW(), NOW()),
('Phòng VIP 4', '', 1, 200, 275, 200, 250, NOW(), NOW()),
('Sân thượng', 'Khu vực ngoài trời thoáng mát', 2, 420, 275, 410, 250, NOW(), NOW()),
('Ban công BBQ', 'Khu chuyên nướng BBQ', 2, 850, 275, 200, 250, NOW(), NOW()),
('Phòng VIP 5', '', 2, 416, 100, 200, 150, NOW(), NOW()),
('Phòng VIP 6', NULL, 2, 630, 100, 200, 150, NOW(), NOW()),
('Phòng VIP 7', NULL, 2, 200, 275, 200, 250, NOW(), NOW());

-- 3. Thêm Bàn (Tables)
INSERT INTO `restaurant_tables` 
(`name`, `capacity`, `status`, `base_deposit`, `position_x`, `position_y`, `width`, `height`, `rotation`, `shape`, `area_id`, `created_at`, `updated_at`)
VALUES
-- Area 1: Sảnh chính (ID 1)
('SC-1', 6, 'AVAILABLE', 0.00, -280, -180, 90, 90, 0, 'SQUARE', 1, NOW(), NOW()),
('SC-2', 6, 'AVAILABLE', 0.00, -80, -180, 90, 90, 0, 'SQUARE', 1, NOW(), NOW()),
('SC-3', 6, 'AVAILABLE', 0.00, 855, 80, 90, 90, 0, 'SQUARE', 1, NOW(), NOW()),
('SC-4', 6, 'AVAILABLE', 0.00, 120, -180, 90, 90, 0, 'SQUARE', 1, NOW(), NOW()),
('SC-5', 6, 'AVAILABLE', 0.00, 520, 180, 90, 90, 0, 'SQUARE', 1, NOW(), NOW()),
('SC-6', 6, 'AVAILABLE', 0.00, 855, 330, 90, 90, 0, 'SQUARE', 1, NOW(), NOW()),
('SC-7', 10, 'AVAILABLE', 0.00, -280, 0, 200, 90, 0, 'RECT', 1, NOW(), NOW()),
('SC-8', 10, 'AVAILABLE', 0.00, 70, 0, 200, 90, 0, 'RECT', 1, NOW(), NOW()),
('SC-9', 6, 'AVAILABLE', 100000.00, 320, -180, 90, 90, 0, 'SQUARE', 1, NOW(), NOW()),
('SC-10', 6, 'AVAILABLE', 100000.00, 520, -180, 90, 90, 0, 'SQUARE', 1, NOW(), NOW()),
('SC-11', 10, 'AVAILABLE', 100000.00, 410, 0, 200, 90, 0, 'RECT', 1, NOW(), NOW()),
('SC-12', 6, 'AVAILABLE', 100000.00, -280, 180, 90, 90, 0, 'SQUARE', 1, NOW(), NOW()),
('SC-13', 6, 'AVAILABLE', 100000.00, -80, 180, 90, 90, 0, 'SQUARE', 1, NOW(), NOW()),
('SC-14', 6, 'AVAILABLE', 100000.00, 320, 180, 90, 90, 0, 'SQUARE', 1, NOW(), NOW()),
('SC-15', 6, 'AVAILABLE', 100000.00, 120, 180, 90, 90, 0, 'SQUARE', 1, NOW(), NOW()),

-- Area 2: Phòng VIP 1 (ID 2)
('VIP1-1', 10, 'AVAILABLE', 500000.00, 0, 100, 359, 160, 0, 'RECT', 2, NOW(), NOW()),

-- Area 3: Phòng VIP 2 (ID 3)
('VIP2-1', 8, 'AVAILABLE', 200000.00, -350, 100, 240, 240, 0, 'CIRCLE', 3, NOW(), NOW()),
('VIP2-2', 8, 'AVAILABLE', 200000.00, 20, 100, 240, 240, 0, 'CIRCLE', 3, NOW(), NOW()),

-- Area 4: Phòng VIP 3 (ID 4)

('VIP3-1', 10, 'AVAILABLE', 100000.00, -390, -110, 270, 120, 0, 'RECT', 4, NOW(), NOW()),
('VIP3-2', 10, 'AVAILABLE', 100000.00, -390, 100, 270, 120, 0, 'RECT', 4, NOW(), NOW()),

-- Area 5: Phòng VIP 4 (ID 5)
('VIP4-1', 8, 'AVAILABLE', 100000.00, 100, -200, 150, 150, 0, 'CIRCLE', 5, NOW(), NOW()),
('VIP4-2', 8, 'AVAILABLE', 100000.00, 101, 30, 150, 150, 0, 'CIRCLE', 5, NOW(), NOW()),
('VIP4-3', 8, 'AVAILABLE', 100000.00, 500, -200, 150, 150, 0, 'CIRCLE', 5, NOW(), NOW()),
('VIP4-4', 8, 'AVAILABLE', 100000.00, 503, 30, 150, 150, 0, 'CIRCLE', 5, NOW(), NOW()),

-- Area 6: Sân thượng (ID 6)
('T2-1', 6, 'AVAILABLE', 0.00, -280, -180, 90, 90, 0, 'SQUARE', 6, NOW(), NOW()),
('T2-2', 6, 'AVAILABLE', 0.00, -80, -180, 90, 90, 0, 'SQUARE', 6, NOW(), NOW()),
('T2-3', 6, 'AVAILABLE', 0.00, 855, 80, 90, 90, 0, 'SQUARE', 6, NOW(), NOW()),
('T2-4', 6, 'AVAILABLE', 0.00, 120, -180, 90, 90, 0, 'SQUARE', 6, NOW(), NOW()),
('T2-5', 6, 'AVAILABLE', 0.00, 520, 180, 90, 90, 0, 'SQUARE', 6, NOW(), NOW()),
('T2-6', 6, 'AVAILABLE', 0.00, 855, 330, 90, 90, 0, 'SQUARE', 6, NOW(), NOW()),
('T2-7', 10, 'AVAILABLE', 0.00, -280, 0, 200, 90, 0, 'RECT', 6, NOW(), NOW()),
('T2-8', 10, 'AVAILABLE', 0.00, 70, 0, 200, 90, 0, 'RECT', 6, NOW(), NOW()),
('T2-9', 6, 'AVAILABLE', 100000.00, 320, -180, 90, 90, 0, 'SQUARE', 6, NOW(), NOW()),
('T2-10', 6, 'AVAILABLE', 100000.00, 520, -180, 90, 90, 0, 'SQUARE', 6, NOW(), NOW()),
('T2-11', 10, 'AVAILABLE', 100000.00, 410, 0, 200, 90, 0, 'RECT', 6, NOW(), NOW()),
('T2-12', 6, 'AVAILABLE', 100000.00, -280, 180, 90, 90, 0, 'SQUARE', 6, NOW(), NOW()),
('T2-13', 6, 'AVAILABLE', 100000.00, -80, 180, 90, 90, 0, 'SQUARE', 6, NOW(), NOW()),
('T2-14', 6, 'AVAILABLE', 100000.00, 320, 180, 90, 90, 0, 'SQUARE', 6, NOW(), NOW()),
('T2-15', 6, 'AVAILABLE', 100000.00, 120, 180, 90, 90, 0, 'SQUARE', 6, NOW(), NOW()),

-- Area 7: Ban công BBQ (ID 7)
('BBQ-1', 8, 'AVAILABLE', 100000.00, -501, -200, 150, 150, 0, 'CIRCLE', 7, NOW(), NOW()),
('BBQ-2', 8, 'AVAILABLE', 100000.00, -183, 79, 150, 150, 0, 'CIRCLE', 7, NOW(), NOW()),
('BBQ-3', 8, 'AVAILABLE', 100000.00, -500, 80, 150, 150, 0, 'CIRCLE', 7, NOW(), NOW()),
('BBQ-4', 8, 'AVAILABLE', 100000.00, -182, -200, 150, 150, 0, 'CIRCLE', 7, NOW(), NOW()),

-- Area 8: Phòng VIP 5 (ID 8)
('VIP5-1', 10, 'AVAILABLE', 500000.00, 0, 100, 359, 160, 0, 'RECT', 8, NOW(), NOW()),

-- Area 9: Phòng VIP 6 (ID 9)
('VIP6-1', 8, 'AVAILABLE', 200000.00, -350, 100, 240, 240, 0, 'CIRCLE', 9, NOW(), NOW()),
('VIP6-2', 8, 'AVAILABLE', 200000.00, 20, 100, 240, 240, 0, 'CIRCLE', 9, NOW(), NOW()),

-- Area 10: Phòng VIP 7 (ID 10)
('VIP7-1', 8, 'AVAILABLE', 100000.00, 100, -200, 150, 150, 0, 'CIRCLE', 10, NOW(), NOW()),
('VIP7-2', 8, 'AVAILABLE', 100000.00, 101, 30, 150, 150, 0, 'CIRCLE', 10, NOW(), NOW()),
('VIP7-3', 8, 'AVAILABLE', 100000.00, 500, -200, 150, 150, 0, 'CIRCLE', 10, NOW(), NOW()),
('VIP7-4', 8, 'AVAILABLE', 100000.00, 503, 30, 150, 150, 0, 'CIRCLE', 10, NOW(), NOW());