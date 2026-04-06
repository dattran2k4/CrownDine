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

-- STANDALONE ORDERS
INSERT INTO orders (id, code, user_id, reservation_id, restaurant_table_id, voucher_id, total_price, discount_price,
                    final_price, status, created_at, updated_at)
VALUES (1, 'ORD-001', 1, NULL, 1, NULL, 328000.00, 0, 328000.00, 'COMPLETED', NOW(), NOW()),
       (2, 'ORD-002', 2, NULL, 2, NULL, 238000.00, 0, 238000.00, 'COMPLETED', NOW(), NOW());

-- DỮ LIỆU SEED CHO DASHBOARD: HÔM NAY, HÔM QUA, 7 NGÀY QUA, THÁNG NÀY, THÁNG TRƯỚC
-- Lưu ý: Sử dụng CURDATE() và DATE_SUB() để dữ liệu luôn phản ánh đúng theo thời điểm hiện tại khi chạy script.

-- 1. HÔM NAY (TODAY): Các mốc thời gian từ 7g-22g
INSERT INTO orders (id, code, user_id, reservation_id, restaurant_table_id, voucher_id, total_price, discount_price,
                    final_price, status, created_at, updated_at)
VALUES (3, 'ORD-003', 2, NULL, 1, NULL, 150000.00, 0, 150000.00, 'COMPLETED', CONCAT(CURDATE(), ' 07:30:00'),
        CONCAT(CURDATE(), ' 07:30:00')),
       (4, 'ORD-004', 3, NULL, 2, NULL, 280000.00, 0, 280000.00, 'COMPLETED', CONCAT(CURDATE(), ' 09:15:00'),
        CONCAT(CURDATE(), ' 09:15:00')),
       (5, 'ORD-005', 1, NULL, 3, NULL, 550000.00, 0, 550000.00, 'COMPLETED', CONCAT(CURDATE(), ' 12:45:00'),
        CONCAT(CURDATE(), ' 12:45:00')),
       (6, 'ORD-006', 2, NULL, 4, NULL, 320000.00, 0, 320000.00, 'COMPLETED', CONCAT(CURDATE(), ' 15:20:00'),
        CONCAT(CURDATE(), ' 15:20:00')),
       (7, 'ORD-007', 3, NULL, 1, NULL, 850000.00, 0, 850000.00, 'COMPLETED', CONCAT(CURDATE(), ' 18:50:00'),
        CONCAT(CURDATE(), ' 18:50:00')),
       (8, 'ORD-008', 1, NULL, 2, NULL, 620000.00, 0, 620000.00, 'COMPLETED', CONCAT(CURDATE(), ' 21:10:00'),
        CONCAT(CURDATE(), ' 21:10:00')),
       (9, 'ORD-009', 2, NULL, 3, NULL, 400000.00, 0, 400000.00, 'COMPLETED', CONCAT(CURDATE(), ' 19:30:00'),
        CONCAT(CURDATE(), ' 19:30:00'));

-- 2. HÔM QUA (YESTERDAY): Các mốc thời gian từ 8g-22g
INSERT INTO orders (id, code, user_id, reservation_id, restaurant_table_id, voucher_id, total_price, discount_price,
                    final_price, status, created_at, updated_at)
VALUES (10, 'ORD-010', 1, NULL, 1, NULL, 200000.00, 0, 200000.00, 'COMPLETED',
        CONCAT(DATE_SUB(CURDATE(), INTERVAL 1 DAY), ' 08:00:00'),
        CONCAT(DATE_SUB(CURDATE(), INTERVAL 1 DAY), ' 08:00:00')),
       (11, 'ORD-011', 2, NULL, 2, NULL, 420000.00, 0, 420000.00, 'COMPLETED',
        CONCAT(DATE_SUB(CURDATE(), INTERVAL 1 DAY), ' 11:30:00'),
        CONCAT(DATE_SUB(CURDATE(), INTERVAL 1 DAY), ' 11:30:00')),
       (12, 'ORD-012', 3, NULL, 3, NULL, 350000.00, 0, 350000.00, 'COMPLETED',
        CONCAT(DATE_SUB(CURDATE(), INTERVAL 1 DAY), ' 14:00:00'),
        CONCAT(DATE_SUB(CURDATE(), INTERVAL 1 DAY), ' 14:00:00')),
       (13, 'ORD-013', 1, NULL, 4, NULL, 620000.00, 0, 620000.00, 'COMPLETED',
        CONCAT(DATE_SUB(CURDATE(), INTERVAL 1 DAY), ' 17:00:00'),
        CONCAT(DATE_SUB(CURDATE(), INTERVAL 1 DAY), ' 17:00:00')),
       (14, 'ORD-014', 2, NULL, 1, NULL, 950000.00, 0, 950000.00, 'COMPLETED',
        CONCAT(DATE_SUB(CURDATE(), INTERVAL 1 DAY), ' 19:30:00'),
        CONCAT(DATE_SUB(CURDATE(), INTERVAL 1 DAY), ' 19:30:00')),
       (15, 'ORD-015', 3, NULL, 2, NULL, 580000.00, 0, 580000.00, 'COMPLETED',
        CONCAT(DATE_SUB(CURDATE(), INTERVAL 1 DAY), ' 21:45:00'),
        CONCAT(DATE_SUB(CURDATE(), INTERVAL 1 DAY), ' 21:45:00'));

-- 3. 7 NGÀY QUA (LAST 7 DAYS - Không tính hôm nay và hôm qua)
INSERT INTO orders (id, code, user_id, reservation_id, restaurant_table_id, voucher_id, total_price, discount_price,
                    final_price, status, created_at, updated_at)
VALUES (16, 'ORD-016', 1, NULL, 1, NULL, 1200000.00, 0, 1200000.00, 'COMPLETED',
        CONCAT(DATE_SUB(CURDATE(), INTERVAL 2 DAY), ' 12:00:00'),
        CONCAT(DATE_SUB(CURDATE(), INTERVAL 2 DAY), ' 12:00:00')),
       (17, 'ORD-017', 2, NULL, 2, NULL, 1500000.00, 0, 1500000.00, 'COMPLETED',
        CONCAT(DATE_SUB(CURDATE(), INTERVAL 3 DAY), ' 13:00:00'),
        CONCAT(DATE_SUB(CURDATE(), INTERVAL 3 DAY), ' 13:00:00')),
       (18, 'ORD-018', 3, NULL, 3, NULL, 900000.00, 0, 900000.00, 'COMPLETED',
        CONCAT(DATE_SUB(CURDATE(), INTERVAL 4 DAY), ' 18:00:00'),
        CONCAT(DATE_SUB(CURDATE(), INTERVAL 4 DAY), ' 18:00:00')),
       (19, 'ORD-019', 1, NULL, 4, NULL, 1800000.00, 0, 1800000.00, 'COMPLETED',
        CONCAT(DATE_SUB(CURDATE(), INTERVAL 5 DAY), ' 19:00:00'),
        CONCAT(DATE_SUB(CURDATE(), INTERVAL 5 DAY), ' 19:00:00')),
       (20, 'ORD-020', 2, NULL, 1, NULL, 1100000.00, 0, 1100000.00, 'COMPLETED',
        CONCAT(DATE_SUB(CURDATE(), INTERVAL 6 DAY), ' 12:00:00'),
        CONCAT(DATE_SUB(CURDATE(), INTERVAL 6 DAY), ' 12:00:00'));

-- 4. THÁNG NÀY (THIS MONTH - Các ngày đầu tháng)
INSERT INTO orders (id, code, user_id, reservation_id, restaurant_table_id, voucher_id, total_price, discount_price,
                    final_price, status, created_at, updated_at)
VALUES (21, 'ORD-021', 1, NULL, 2, NULL, 2500000.00, 0, 2500000.00, 'COMPLETED',
        CONCAT(LAST_DAY(DATE_SUB(CURDATE(), INTERVAL 1 MONTH)) + INTERVAL 1 DAY, ' 12:00:00'),
        CONCAT(LAST_DAY(DATE_SUB(CURDATE(), INTERVAL 1 MONTH)) + INTERVAL 1 DAY, ' 12:00:00')),
       (22, 'ORD-022', 3, NULL, 3, NULL, 3200000.00, 0, 3200000.00, 'COMPLETED',
        CONCAT(LAST_DAY(DATE_SUB(CURDATE(), INTERVAL 1 MONTH)) + INTERVAL 5 DAY, ' 18:00:00'),
        CONCAT(LAST_DAY(DATE_SUB(CURDATE(), INTERVAL 1 MONTH)) + INTERVAL 5 DAY, ' 18:00:00'));

-- 5. THÁNG TRƯỚC (LAST MONTH): Một vài ngày cố định
INSERT INTO orders (id, code, user_id, reservation_id, restaurant_table_id, voucher_id, total_price, discount_price,
                    final_price, status, created_at, updated_at)
VALUES (23, 'ORD-023', 1, NULL, 1, NULL, 1000000.00, 0, 1000000.00, 'COMPLETED',
        CONCAT(DATE_SUB(LAST_DAY(DATE_SUB(CURDATE(), INTERVAL 1 MONTH)), INTERVAL 25 DAY), ' 12:00:00'),
        CONCAT(DATE_SUB(LAST_DAY(DATE_SUB(CURDATE(), INTERVAL 1 MONTH)), INTERVAL 25 DAY), ' 12:00:00')),
       (24, 'ORD-024', 2, NULL, 2, NULL, 1200000.00, 0, 1200000.00, 'COMPLETED',
        CONCAT(DATE_SUB(LAST_DAY(DATE_SUB(CURDATE(), INTERVAL 1 MONTH)), INTERVAL 15 DAY), ' 13:00:00'),
        CONCAT(DATE_SUB(LAST_DAY(DATE_SUB(CURDATE(), INTERVAL 1 MONTH)), INTERVAL 15 DAY), ' 13:00:00')),
       (25, 'ORD-025', 3, NULL, 3, NULL, 1800000.00, 0, 1800000.00, 'COMPLETED',
        CONCAT(DATE_SUB(LAST_DAY(DATE_SUB(CURDATE(), INTERVAL 1 MONTH)), INTERVAL 10 DAY), ' 18:00:00'),
        CONCAT(DATE_SUB(LAST_DAY(DATE_SUB(CURDATE(), INTERVAL 1 MONTH)), INTERVAL 10 DAY), ' 18:00:00')),
       (26, 'ORD-026', 1, NULL, 4, NULL, 2200000.00, 0, 2200000.00, 'COMPLETED',
        CONCAT(DATE_SUB(LAST_DAY(DATE_SUB(CURDATE(), INTERVAL 1 MONTH)), INTERVAL 5 DAY), ' 19:00:00'),
        CONCAT(DATE_SUB(LAST_DAY(DATE_SUB(CURDATE(), INTERVAL 1 MONTH)), INTERVAL 5 DAY), ' 19:00:00')),
       (27, 'ORD-027', 2, NULL, 1, NULL, 1500000.00, 0, 1500000.00, 'COMPLETED',
        CONCAT(DATE_SUB(LAST_DAY(DATE_SUB(CURDATE(), INTERVAL 1 MONTH)), INTERVAL 1 DAY), ' 20:00:00'),
        CONCAT(DATE_SUB(LAST_DAY(DATE_SUB(CURDATE(), INTERVAL 1 MONTH)), INTERVAL 1 DAY), ' 20:00:00'));

INSERT INTO order_details
(order_id, item_id, combo_id, quantity, total_price, note, created_at, updated_at)
VALUES
-- Order 1: gọi món lẻ
(1, 6, NULL, 1, 229000.00, 'Ít cay', NOW(), NOW()),
(1, 7, NULL, 1, 39000.00, NULL, NOW(), NOW()),
(1, 9, NULL, 1, 35000.00, 'Ít đá', NOW(), NOW()),
(1, 11, NULL, 1, 25000.00, NULL, NOW(), NOW()),

-- Order 2: gọi combo
(2, NULL, 4, 1, 219000.00, 'Không hành', NOW(), NOW()),
-- thêm 1 coca lẻ
(2, 10, NULL, 1, 19000.00, NULL, NOW(), NOW());

-- DATA CHO TOP PRODUCTS (Order Details cho các đơn dashboard)
INSERT INTO order_details (order_id, item_id, combo_id, quantity, total_price, created_at, updated_at)
VALUES
-- Hôm nay (Orders 3-9)
(3, 4, NULL, 1, 150000.00, CONCAT(CURDATE(), ' 07:30:00'), CONCAT(CURDATE(), ' 07:30:00')), -- Bò bít tết
(4, 3, NULL, 2, 280000.00, CONCAT(CURDATE(), ' 09:15:00'), CONCAT(CURDATE(), ' 09:15:00')), -- Gà chiên mắm
(5, 6, NULL, 1, 550000.00, CONCAT(CURDATE(), ' 12:45:00'), CONCAT(CURDATE(), ' 12:45:00')), -- Lẩu thái
(6, 8, NULL, 2, 320000.00, CONCAT(CURDATE(), ' 15:20:00'), CONCAT(CURDATE(), ' 15:20:00')), -- Tôm hấp
(7, 1, NULL, 1, 35000.00, CONCAT(CURDATE(), ' 18:50:00'), CONCAT(CURDATE(), ' 18:50:00')),  -- Súp cua (MỚI)
(7, 2, NULL, 1, 45000.00, CONCAT(CURDATE(), ' 18:50:00'), CONCAT(CURDATE(), ' 18:50:00')),  -- Salad (MỚI)
(7, 9, NULL, 2, 70000.00, CONCAT(CURDATE(), ' 18:50:00'), CONCAT(CURDATE(), ' 18:50:00')),  -- Trà đào (MỚI)
(8, 3, NULL, 5, 620000.00, CONCAT(CURDATE(), ' 21:10:00'), CONCAT(CURDATE(), ' 21:10:00')), -- Gà chiên mắm
(9, 6, NULL, 2, 400000.00, CONCAT(CURDATE(), ' 19:30:00'), CONCAT(CURDATE(), ' 19:30:00')), -- Lẩu thái

-- Hôm qua (Orders 10-15)
(10, 4, NULL, 2, 200000.00, CONCAT(DATE_SUB(CURDATE(), INTERVAL 1 DAY), ' 08:00:00'),
 CONCAT(DATE_SUB(CURDATE(), INTERVAL 1 DAY), ' 08:00:00')),
(11, 3, NULL, 4, 420000.00, CONCAT(DATE_SUB(CURDATE(), INTERVAL 1 DAY), ' 11:30:00'),
 CONCAT(DATE_SUB(CURDATE(), INTERVAL 1 DAY), ' 11:30:00')),
(12, 6, NULL, 1, 350000.00, CONCAT(DATE_SUB(CURDATE(), INTERVAL 1 DAY), ' 14:00:00'),
 CONCAT(DATE_SUB(CURDATE(), INTERVAL 1 DAY), ' 14:00:00')),
(13, 8, NULL, 4, 620000.00, CONCAT(DATE_SUB(CURDATE(), INTERVAL 1 DAY), ' 17:00:00'),
 CONCAT(DATE_SUB(CURDATE(), INTERVAL 1 DAY), ' 17:00:00')),
(14, 5, NULL, 3, 300000.00, CONCAT(DATE_SUB(CURDATE(), INTERVAL 1 DAY), ' 19:30:00'),
 CONCAT(DATE_SUB(CURDATE(), INTERVAL 1 DAY), ' 19:30:00')),                                 -- Heo quay (MỚI)
(15, 7, NULL, 5, 195000.00, CONCAT(DATE_SUB(CURDATE(), INTERVAL 1 DAY), ' 21:45:00'),
 CONCAT(DATE_SUB(CURDATE(), INTERVAL 1 DAY), ' 21:45:00')),                                 -- Rau muống (MỚI)
(15, 10, NULL, 5, 95000.00, CONCAT(DATE_SUB(CURDATE(), INTERVAL 1 DAY), ' 21:45:00'),
 CONCAT(DATE_SUB(CURDATE(), INTERVAL 1 DAY), ' 21:45:00')),                                 -- Coca (MỚI)

-- 7 ngày qua (Orders 16-20)
(16, 4, NULL, 3, 567000.00, CONCAT(DATE_SUB(CURDATE(), INTERVAL 2 DAY), ' 12:00:00'),
 CONCAT(DATE_SUB(CURDATE(), INTERVAL 2 DAY), ' 12:00:00')),
(16, 11, NULL, 2, 50000.00, CONCAT(DATE_SUB(CURDATE(), INTERVAL 2 DAY), ' 12:00:00'),
 CONCAT(DATE_SUB(CURDATE(), INTERVAL 2 DAY), ' 12:00:00')),                                 -- Bánh flan (MỚI)
(17, NULL, 1, 2, 578000.00, CONCAT(DATE_SUB(CURDATE(), INTERVAL 3 DAY), ' 13:00:00'),
 CONCAT(DATE_SUB(CURDATE(), INTERVAL 3 DAY), ' 13:00:00')),                                 -- Combo 1 (MỚI)
(18, NULL, 2, 1, 159000.00, CONCAT(DATE_SUB(CURDATE(), INTERVAL 4 DAY), ' 18:00:00'),
 CONCAT(DATE_SUB(CURDATE(), INTERVAL 4 DAY), ' 18:00:00')),                                 -- Combo 2 (MỚI)
(19, NULL, 3, 1, 229000.00, CONCAT(DATE_SUB(CURDATE(), INTERVAL 5 DAY), ' 19:00:00'),
 CONCAT(DATE_SUB(CURDATE(), INTERVAL 5 DAY), ' 19:00:00')),                                 -- Combo 3 (MỚI)
(20, NULL, 4, 1, 219000.00, CONCAT(DATE_SUB(CURDATE(), INTERVAL 6 DAY), ' 12:00:00'),
 CONCAT(DATE_SUB(CURDATE(), INTERVAL 6 DAY), ' 12:00:00')),                                 -- Combo 4 (MỚI)

-- Tháng này (Orders 21-22)
(21, 6, NULL, 8, 2500000.00, CONCAT(LAST_DAY(DATE_SUB(CURDATE(), INTERVAL 1 MONTH)) + INTERVAL 1 DAY, ' 12:00:00'),
 CONCAT(LAST_DAY(DATE_SUB(CURDATE(), INTERVAL 1 MONTH)) + INTERVAL 1 DAY, ' 12:00:00')),
(22, 4, NULL, 15, 3200000.00, CONCAT(LAST_DAY(DATE_SUB(CURDATE(), INTERVAL 1 MONTH)) + INTERVAL 5 DAY, ' 18:00:00'),
 CONCAT(LAST_DAY(DATE_SUB(CURDATE(), INTERVAL 1 MONTH)) + INTERVAL 5 DAY, ' 18:00:00')),

-- Tháng trước (Orders 23-27)
(23, 3, NULL, 10, 1000000.00,
 CONCAT(DATE_SUB(LAST_DAY(DATE_SUB(CURDATE(), INTERVAL 1 MONTH)), INTERVAL 25 DAY), ' 12:00:00'),
 CONCAT(DATE_SUB(LAST_DAY(DATE_SUB(CURDATE(), INTERVAL 1 MONTH)), INTERVAL 25 DAY), ' 12:00:00')),
(24, 6, NULL, 4, 1200000.00,
 CONCAT(DATE_SUB(LAST_DAY(DATE_SUB(CURDATE(), INTERVAL 1 MONTH)), INTERVAL 15 DAY), ' 13:00:00'),
 CONCAT(DATE_SUB(LAST_DAY(DATE_SUB(CURDATE(), INTERVAL 1 MONTH)), INTERVAL 15 DAY), ' 13:00:00')),
(25, 8, NULL, 12, 1800000.00,
 CONCAT(DATE_SUB(LAST_DAY(DATE_SUB(CURDATE(), INTERVAL 1 MONTH)), INTERVAL 10 DAY), ' 18:00:00'),
 CONCAT(DATE_SUB(LAST_DAY(DATE_SUB(CURDATE(), INTERVAL 1 MONTH)), INTERVAL 10 DAY), ' 18:00:00')),
(26, 4, NULL, 15, 2200000.00,
 CONCAT(DATE_SUB(LAST_DAY(DATE_SUB(CURDATE(), INTERVAL 1 MONTH)), INTERVAL 5 DAY), ' 19:00:00'),
 CONCAT(DATE_SUB(LAST_DAY(DATE_SUB(CURDATE(), INTERVAL 1 MONTH)), INTERVAL 5 DAY), ' 19:00:00')),
(27, 3, NULL, 15, 1500000.00,
 CONCAT(DATE_SUB(LAST_DAY(DATE_SUB(CURDATE(), INTERVAL 1 MONTH)), INTERVAL 1 DAY), ' 20:00:00'),
 CONCAT(DATE_SUB(LAST_DAY(DATE_SUB(CURDATE(), INTERVAL 1 MONTH)), INTERVAL 1 DAY), ' 20:00:00'));
