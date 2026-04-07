-- =========================================================================
-- Flyway Migration V10
-- Populate Initial Data for Floor, Area, and Table Coordinates
-- =========================================================================

-- 1. Thêm Tầng (Floors)
INSERT INTO `floors` (`name`, `floor_number`, `description`, `created_at`, `updated_at`)
VALUES ('Tầng 1', 1, 'Khu vực trong nhà chính và phòng VIP', NOW(), NOW()),
       ('Tầng 2', 2, 'Khu vực ngoài trời và sân thượng', NOW(), NOW());


-- 2. Thêm Khu Vực (Areas) - Tránh overlap, canh chỉnh perfect margin
-- Tầng 1 (floor_id = 1)
INSERT INTO `areas` (`name`, `description`, `floor_id`, `x`, `y`, `width`, `height`, `created_at`, `updated_at`)
VALUES ('Sảnh chính', 'Khu vực ăn uống chung rộng rãi', 1, 420, 275, 410, 250, NOW(), NOW()),
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
(`name`, `capacity`, `status`, `base_deposit`, `position_x`, `position_y`, `width`, `height`, `rotation`, `shape`,
 `area_id`, `image_url`, `description`, `created_at`, `updated_at`)
VALUES
-- Area 1: Sảnh chính (ID 1)
('SC-1', 6, 'AVAILABLE', 0.00, -280, -180, 90, 90, 0, 'SQUARE', 1,
 'https://plus.unsplash.com/premium_photo-1673108530231-e1e73e91d622?q=80&w=1000&auto=format&fit=crop',
 'Bàn 6 người sang trọng view trung tâm sảnh.', NOW(), NOW()),
('SC-2', 6, 'AVAILABLE', 0.00, -80, -180, 90, 90, 0, 'SQUARE', 1,
 'https://plus.unsplash.com/premium_photo-1673108530231-e1e73e91d622?q=80&w=1000&auto=format&fit=crop',
 'Bàn 6 người khu vực trung tâm, không gian thoáng đãng.', NOW(), NOW()),
('SC-3', 6, 'AVAILABLE', 0.00, 855, 80, 90, 90, 0, 'SQUARE', 1,
 'https://plus.unsplash.com/premium_photo-1673108530231-e1e73e91d622?q=80&w=1000&auto=format&fit=crop',
 'Góc bàn riêng tư cạnh cửa sổ, nhìn ra sảnh chính.', NOW(), NOW()),
('SC-4', 6, 'AVAILABLE', 0.00, 120, -180, 90, 90, 0, 'SQUARE', 1,
 'https://plus.unsplash.com/premium_photo-1673108530231-e1e73e91d622?q=80&w=1000&auto=format&fit=crop',
 'Vị trí lý tưởng để quan sát các buổi biểu diễn âm nhạc.', NOW(), NOW()),
('SC-5', 6, 'AVAILABLE', 0.00, 520, 180, 90, 90, 0, 'SQUARE', 1,
 'https://plus.unsplash.com/premium_photo-1673108530231-e1e73e91d622?q=80&w=1000&auto=format&fit=crop',
 'Bàn tiệc gia đình ấm cúng tại sảnh tầng 1.', NOW(), NOW()),
('SC-6', 6, 'AVAILABLE', 0.00, 855, 330, 90, 90, 0, 'SQUARE', 1,
 'https://plus.unsplash.com/premium_photo-1673108530231-e1e73e91d622?q=80&w=1000&auto=format&fit=crop',
 'Khu trung tâm sảnh, phù hợp cho nhóm bạn trẻ năng động.', NOW(), NOW()),
('SC-7', 10, 'AVAILABLE', 0.00, -280, 0, 200, 90, 0, 'RECT', 1,
 'https://ak1.ostkcdn.com/images/products/is/images/direct/c5b3c26487fe7b03dadb2b2f4dbb5d0dff12e1c6/10-Person-Extendable-63%27%27-to-94.5%27%27-Dining-Set%2CRectangular-Sintered-Stone-Top%2CStainless-Steel-Legs%281-Table-10-Polo-Chairs%29.jpg?impolicy=medium',
 'Bàn tiệc lớn 10 người, không gian rộng rãi thoải mái.', NOW(), NOW()),
('SC-8', 10, 'AVAILABLE', 0.00, 70, 0, 200, 90, 0, 'RECT', 1,
 'https://ak1.ostkcdn.com/images/products/is/images/direct/c5b3c26487fe7b03dadb2b2f4dbb5d0dff12e1c6/10-Person-Extendable-63%27%27-to-94.5%27%27-Dining-Set%2CRectangular-Sintered-Stone-Top%2CStainless-Steel-Legs%281-Table-10-Polo-Chairs%29.jpg?impolicy=medium',
 'Bàn dài cao cấp cho nhóm hội nghị hoặc đại gia đình.', NOW(), NOW()),
('SC-9', 6, 'AVAILABLE', 100000.00, 320, -180, 90, 90, 0, 'SQUARE', 1,
 'https://plus.unsplash.com/premium_photo-1673108530231-e1e73e91d622?q=80&w=1000&auto=format&fit=crop',
 'Bàn vip tiêu chuẩn tại sảnh chính, phục vụ tận tâm.', NOW(), NOW()),
('SC-10', 6, 'AVAILABLE', 100000.00, 520, -180, 90, 90, 0, 'SQUARE', 1,
 'https://plus.unsplash.com/premium_photo-1673108530231-e1e73e91d622?q=80&w=1000&auto=format&fit=crop',
 'Không gian sảnh thượng lưu, trang trí hoa tươi tinh tế.', NOW(), NOW()),
('SC-11', 10, 'AVAILABLE', 100000.00, 410, 0, 200, 90, 0, 'RECT', 1,
 'https://ak1.ostkcdn.com/images/products/is/images/direct/c5b3c26487fe7b03dadb2b2f4dbb5d0dff12e1c6/10-Person-Extendable-63%27%27-to-94.5%27%27-Dining-Set%2CRectangular-Sintered-Stone-Top%2CStainless-Steel-Legs%281-Table-10-Polo-Chairs%29.jpg?impolicy=medium',
 'Khu bàn tiệc dài sảnh chính, riêng tư vừa đủ.', NOW(), NOW()),
('SC-12', 6, 'AVAILABLE', 100000.00, -280, 180, 90, 90, 0, 'SQUARE', 1,
 'https://plus.unsplash.com/premium_photo-1673108530231-e1e73e91d622?q=80&w=1000&auto=format&fit=crop',
 'Góc bàn sảnh gần quầy bar, không khí sôi động.', NOW(), NOW()),
('SC-13', 6, 'AVAILABLE', 100000.00, -80, 180, 90, 90, 0, 'SQUARE', 1,
 'https://plus.unsplash.com/premium_photo-1673108530231-e1e73e91d622?q=80&w=1000&auto=format&fit=crop',
 'Vị trí gần lối vào, trang trí phong cách Châu Âu.', NOW(), NOW()),
('SC-14', 6, 'AVAILABLE', 100000.00, 320, 180, 90, 90, 0, 'SQUARE', 1,
 'https://plus.unsplash.com/premium_photo-1673108530231-e1e73e91d622?q=80&w=1000&auto=format&fit=crop',
 'Khu trung tâm sảnh, thích hợp cho các cặp đôi.', NOW(), NOW()),
('SC-15', 6, 'AVAILABLE', 100000.00, 120, 180, 90, 90, 0, 'SQUARE', 1,
 'https://plus.unsplash.com/premium_photo-1673108530231-e1e73e91d622?q=80&w=1000&auto=format&fit=crop',
 'Bàn sảnh thanh lịch, không gian xanh mát.', NOW(), NOW()),

-- Area 2: Phòng VIP 1 (ID 2)
('VIP1-1', 10, 'AVAILABLE', 500000.00, 0, 100, 359, 160, 0, 'RECT', 2,
 'https://ak1.ostkcdn.com/images/products/is/images/direct/c5b3c26487fe7b03dadb2b2f4dbb5d0dff12e1c6/10-Person-Extendable-63%27%27-to-94.5%27%27-Dining-Set%2CRectangular-Sintered-Stone-Top%2CStainless-Steel-Legs%281-Table-10-Polo-Chairs%29.jpg?impolicy=medium',
 'Phòng VIP 1 với không gian hoàn toàn riêng tư cho 10 khách.', NOW(), NOW()),

-- Area 3: Phòng VIP 2 (ID 3)
('VIP2-1', 8, 'AVAILABLE', 200000.00, -350, 100, 240, 240, 0, 'CIRCLE', 3,
 'https://assets.wfcdn.com/im/14684299/compr-r85/2280/228059320/Aryhanna+8+-+Person+Solid+Wood+Top+Pedestal+Dining+Set.jpg',
 'Bàn tròn lớn tại Phòng VIP 2, lý tưởng cho tiệc gia đình.', NOW(), NOW()),
('VIP2-2', 8, 'AVAILABLE', 200000.00, 20, 100, 240, 240, 0, 'CIRCLE', 3,
 'https://assets.wfcdn.com/im/14684299/compr-r85/2280/228059320/Aryhanna+8+-+Person+Solid+Wood+Top+Pedestal+Dining+Set.jpg',
 'Không gian ấm cúng, riêng tư tuyệt đối cho nhóm 8 người.', NOW(), NOW()),

-- Area 4: Phòng VIP 3 (ID 4)
('VIP3-1', 10, 'AVAILABLE', 100000.00, -390, -110, 270, 120, 0, 'RECT', 4,
 'https://s.alicdn.com/@sc04/kf/H8c581ebf6cb24e8bbe86a609899189c0o/Modern-Luxury-4-people-Dining-Table-Chair-Set-Extendable-Kitchen-Restaurant-Tables-Rock-Plate-Chairs-Small-Marble-Dining-Room.jpg_300x300.jpg',
 'Phòng VIP 3 phong cách hiện đại, phục vụ hội họp doanh nghiệp.', NOW(), NOW()),
('VIP3-2', 10, 'AVAILABLE', 100000.00, -390, 100, 270, 120, 0, 'RECT', 4,
 'https://s.alicdn.com/@sc04/kf/H8c581ebf6cb24e8bbe86a609899189c0o/Modern-Luxury-4-people-Dining-Table-Chair-Set-Extendable-Kitchen-Restaurant-Tables-Rock-Plate-Chairs-Small-Marble-Dining-Room.jpg_300x300.jpg',
 'Bàn dài sang trọng, trang bị hệ thống âm thanh riêng.', NOW(), NOW()),

-- Area 5: Phòng VIP 4 (ID 5)
('VIP4-1', 8, 'AVAILABLE', 100000.00, 100, -200, 150, 150, 0, 'CIRCLE', 5,
 'https://assets.wfcdn.com/im/14684299/compr-r85/2280/228059320/Aryhanna+8+-+Person+Solid+Wood+Top+Pedestal+Dining+Set.jpg',
 'Bàn tròn lớn Phòng VIP 4, không gian trang nhã cổ điển.', NOW(), NOW()),
('VIP4-2', 8, 'AVAILABLE', 100000.00, 101, 30, 150, 150, 0, 'CIRCLE', 5,
 'https://assets.wfcdn.com/im/14684299/compr-r85/2280/228059320/Aryhanna+8+-+Person+Solid+Wood+Top+Pedestal+Dining+Set.jpg',
 'Phòng tiệc nhẹ nhàng, thích hợp cho các buổi ra mắt gia đình.', NOW(), NOW()),
('VIP4-3', 8, 'AVAILABLE', 100000.00, 500, -200, 150, 150, 0, 'CIRCLE', 5,
 'https://assets.wfcdn.com/im/14684299/compr-r85/2280/228059320/Aryhanna+8+-+Person+Solid+Wood+Top+Pedestal+Dining+Set.jpg',
 'Không gian VIP kín đáo, nội thất gỗ sang trọng.', NOW(), NOW()),
('VIP4-4', 8, 'AVAILABLE', 100000.00, 503, 30, 150, 150, 0, 'CIRCLE', 5,
 'https://assets.wfcdn.com/im/14684299/compr-r85/2280/228059320/Aryhanna+8+-+Person+Solid+Wood+Top+Pedestal+Dining+Set.jpg',
 'Bàn tiệc VIP khu vực yên tĩnh nhất nhà hàng.', NOW(), NOW()),

-- Area 6: Sân thượng (ID 6)
('T2-1', 6, 'AVAILABLE', 0.00, -280, -180, 90, 90, 0, 'SQUARE', 6,
 'https://plus.unsplash.com/premium_photo-1673108530231-e1e73e91d622?q=80&w=1000&auto=format&fit=crop',
 'Bàn sân thượng view thành phố lung linh về đêm.', NOW(), NOW()),
('T2-2', 6, 'AVAILABLE', 0.00, -80, -180, 90, 90, 0, 'SQUARE', 6,
 'https://plus.unsplash.com/premium_photo-1673108530231-e1e73e91d622?q=80&w=1000&auto=format&fit=crop',
 'Không gian ngoài trời thoáng mát, đón gió tự nhiên.', NOW(), NOW()),
('T2-3', 6, 'AVAILABLE', 0.00, 855, 80, 90, 90, 0, 'SQUARE', 6,
 'https://plus.unsplash.com/premium_photo-1673108530231-e1e73e91d622?q=80&w=1000&auto=format&fit=crop',
 'Góc sân thượng riêng tư cho các buổi hẹn hò lãng mạn.', NOW(), NOW()),
('T2-4', 6, 'AVAILABLE', 0.00, 120, -180, 90, 90, 0, 'SQUARE', 6,
 'https://plus.unsplash.com/premium_photo-1673108530231-e1e73e91d622?q=80&w=1000&auto=format&fit=crop',
 'Bàn ngoài trời gần khu vực tiểu cảnh, không gian xanh.', NOW(), NOW()),
('T2-5', 6, 'AVAILABLE', 0.00, 520, 180, 90, 90, 0, 'SQUARE', 6,
 'https://plus.unsplash.com/premium_photo-1673108530231-e1e73e91d622?q=80&w=1000&auto=format&fit=crop',
 'Khu vực Rooftop trung tâm, sôi động và náo nhiệt.', NOW(), NOW()),
('T2-6', 6, 'AVAILABLE', 0.00, 855, 330, 90, 90, 0, 'SQUARE', 6,
 'https://plus.unsplash.com/premium_photo-1673108530231-e1e73e91d622?q=80&w=1000&auto=format&fit=crop',
 'Vị trí ngắm hoàng hôn cực đẹp trên tầng thượng.', NOW(), NOW()),
('T2-7', 10, 'AVAILABLE', 0.00, -280, 0, 200, 90, 0, 'RECT', 6,
 'https://ak1.ostkcdn.com/images/products/is/images/direct/c5b3c26487fe7b03dadb2b2f4dbb5d0dff12e1c6/10-Person-Extendable-63%27%27-to-94.5%27%27-Dining-Set%2CRectangular-Sintered-Stone-Top%2CStainless-Steel-Legs%281-Table-10-Polo-Chairs%29.jpg?impolicy=medium',
 'Bàn tiệc lớn ngoài trời, thích hợp cho party công ty.', NOW(), NOW()),
('T2-8', 10, 'AVAILABLE', 0.00, 70, 0, 200, 90, 0, 'RECT', 6,
 'https://ak1.ostkcdn.com/images/products/is/images/direct/c5b3c26487fe7b03dadb2b2f4dbb5d0dff12e1c6/10-Person-Extendable-63%27%27-to-94.5%27%27-Dining-Set%2CRectangular-Sintered-Stone-Top%2CStainless-Steel-Legs%281-Table-10-Polo-Chairs%29.jpg?impolicy=medium',
 'Không gian tiệc tầng thượng, đẳng cấp và tự do.', NOW(), NOW()),
('T2-9', 6, 'AVAILABLE', 100000.00, 320, -180, 90, 90, 0, 'SQUARE', 6,
 'https://plus.unsplash.com/premium_photo-1673108530231-e1e73e91d622?q=80&w=1000&auto=format&fit=crop',
 'Bàn VIP sân thượng, phục vụ cocktail và đồ nướng.', NOW(), NOW()),
('T2-10', 6, 'AVAILABLE', 100000.00, 520, -180, 90, 90, 0, 'SQUARE', 6,
 'https://plus.unsplash.com/premium_photo-1673108530231-e1e73e91d622?q=80&w=1000&auto=format&fit=crop',
 'Không gian cực chill dưới ánh đèn vàng lãng mạn.', NOW(), NOW()),
('T2-11', 10, 'AVAILABLE', 100000.00, 410, 0, 200, 90, 0, 'RECT', 6,
 'https://ak1.ostkcdn.com/images/products/is/images/direct/c5b3c26487fe7b03dadb2b2f4dbb5d0dff12e1c6/10-Person-Extendable-63%27%27-to-94.5%27%27-Dining-Set%2CRectangular-Sintered-Stone-Top%2CStainless-Steel-Legs%281-Table-10-Polo-Chairs%29.jpg?impolicy=medium',
 'Bàn dài VIP sân thượng khép kín khu riêng biệt.', NOW(), NOW()),
('T2-12', 6, 'AVAILABLE', 100000.00, -280, 180, 90, 90, 0, 'SQUARE', 6,
 'https://plus.unsplash.com/premium_photo-1673108530231-e1e73e91d622?q=80&w=1000&auto=format&fit=crop',
 'Góc bàn view bao trọn toàn cảnh nhà hàng từ trên cao.', NOW(), NOW()),
('T2-13', 6, 'AVAILABLE', 100000.00, -80, 180, 90, 90, 0, 'SQUARE', 6,
 'https://plus.unsplash.com/premium_photo-1673108530231-e1e73e91d622?q=80&w=1000&auto=format&fit=crop',
 'Bàn sân thượng phong cách vintage, mộc mạc và gần gũi.', NOW(), NOW()),
('T2-14', 6, 'AVAILABLE', 100000.00, 320, 180, 90, 90, 0, 'SQUARE', 6,
 'https://plus.unsplash.com/premium_photo-1673108530231-e1e73e91d622?q=80&w=1000&auto=format&fit=crop',
 'Khu vực Rooftop Bar sôi động với âm nhạc EDM nhẹ.', NOW(), NOW()),
('T2-15', 6, 'AVAILABLE', 100000.00, 120, 180, 90, 90, 0, 'SQUARE', 6,
 'https://plus.unsplash.com/premium_photo-1673108530231-e1e73e91d622?q=80&w=1000&auto=format&fit=crop',
 'Bàn sân thượng cạnh quầy DJ, trải nghiệm không khí trẻ trung.', NOW(), NOW()),

-- Area 7: Ban công BBQ (ID 7)
('BBQ-1', 8, 'AVAILABLE', 100000.00, -501, -200, 150, 150, 0, 'CIRCLE', 7,
 'https://plus.unsplash.com/premium_photo-1673108530231-e1e73e91d622?q=80&w=1000&auto=format&fit=crop',
 'Bàn tròn nướng BBQ ngoài trời, hệ thống hút khói hiện đại.', NOW(), NOW()),
('BBQ-2', 8, 'AVAILABLE', 100000.00, -183, 79, 150, 150, 0, 'CIRCLE', 7,
 'https://plus.unsplash.com/premium_photo-1673108530231-e1e73e91d622?q=80&w=1000&auto=format&fit=crop',
 'Không gian tiệc nướng BBQ lộng gió, view hồ bơi (giả tưởng).', NOW(), NOW()),
('BBQ-3', 8, 'AVAILABLE', 100000.00, -500, 80, 150, 150, 0, 'CIRCLE', 7,
 'https://plus.unsplash.com/premium_photo-1673108530231-e1e73e91d622?q=80&w=1000&auto=format&fit=crop',
 'Vị trí BBQ lý tưởng cho bữa tiệc tụ tập bạn bè cuối tuần.', NOW(), NOW()),
('BBQ-4', 8, 'AVAILABLE', 100000.00, -182, -200, 150, 150, 0, 'CIRCLE', 7,
 'https://plus.unsplash.com/premium_photo-1673108530231-e1e73e91d622?q=80&w=1000&auto=format&fit=crop',
 'Khu nướng BBQ gia đình, thân mật và thoáng đãng.', NOW(), NOW()),

-- Area 8: Phòng VIP 5 (ID 8)
('VIP5-1', 10, 'AVAILABLE', 500000.00, 0, 100, 359, 160, 0, 'RECT', 8,
 'https://plus.unsplash.com/premium_photo-1673108530231-e1e73e91d622?q=80&w=1000&auto=format&fit=crop',
 'Siêu phòng VIP 5, nội thất hoàng gia cao cấp nhất.', NOW(), NOW()),

-- Area 9: Phòng VIP 6 (ID 9)
('VIP6-1', 8, 'AVAILABLE', 200000.00, -350, 100, 240, 240, 0, 'CIRCLE', 9,
 'https://plus.unsplash.com/premium_photo-1673108530231-e1e73e91d622?q=80&w=1000&auto=format&fit=crop',
 'Phòng VIP 6 yên tĩnh, phục vụ các buổi họp trà đạo.', NOW(), NOW()),
('VIP6-2', 8, 'AVAILABLE', 200000.00, 20, 100, 240, 240, 0, 'CIRCLE', 9,
 'https://plus.unsplash.com/premium_photo-1673108530231-e1e73e91d622?q=80&w=1000&auto=format&fit=crop',
 'Bàn tròn sang trọng, phục vụ menu đặc biệt thượng hạng.', NOW(), NOW()),

-- Area 10: Phòng VIP 7 (ID 10)
('VIP7-1', 8, 'AVAILABLE', 100000.00, 100, -200, 150, 150, 0, 'CIRCLE', 10,
 'https://plus.unsplash.com/premium_photo-1673108530231-e1e73e91d622?q=80&w=1000&auto=format&fit=crop',
 'Phòng VIP 7 phong cách Nhật Bản tối giản, tinh tế.', NOW(), NOW()),
('VIP7-2', 8, 'AVAILABLE', 100000.00, 101, 30, 150, 150, 0, 'CIRCLE', 10,
 'https://plus.unsplash.com/premium_photo-1673108530231-e1e73e91d622?q=80&w=1000&auto=format&fit=crop',
 'Không gian riêng tư nhẹ nhàng cho các cuộc trò chuyện sâu sắc.', NOW(), NOW()),
('VIP7-3', 8, 'AVAILABLE', 100000.00, 500, -200, 150, 150, 0, 'CIRCLE', 10,
 'https://plus.unsplash.com/premium_photo-1673108530231-e1e73e91d622?q=80&w=1000&auto=format&fit=crop',
 'Bàn VIP 7 khép kín, đội ngũ phục vụ riêng biệt.', NOW(), NOW()),
('VIP7-4', 8, 'AVAILABLE', 100000.00, 503, 30, 150, 150, 0, 'CIRCLE', 10,
 'https://plus.unsplash.com/premium_photo-1673108530231-e1e73e91d622?q=80&w=1000&auto=format&fit=crop',
 'Phòng VIP cuối dãy, không gian cực kỳ yên tĩnh và trang trọng.', NOW(), NOW());


--
-- INSERT INTO restaurant_tables (id, name, capacity, status, created_at, updated_at)
-- VALUES (1, 'Bàn 1', 4, 'AVAILABLE', NOW(), NOW()),
--        (2, 'Bàn 2', 4, 'AVAILABLE', NOW(), NOW()),
--        (3, 'Bàn 3', 4, 'AVAILABLE', NOW(), NOW()),
--        (4, 'Bàn 4', 4, 'AVAILABLE', NOW(), NOW());
--

