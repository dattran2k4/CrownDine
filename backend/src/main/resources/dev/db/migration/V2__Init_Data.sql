INSERT INTO roles (name, description, created_at, updated_at)
VALUES ('ADMIN', 'Quản trị hệ thống', NOW(), NOW()),
       ('STAFF', 'Nhân viên nhà hàng', NOW(), NOW()),
       ('USER', 'Khách hàng', NOW(), NOW());

INSERT INTO shifts (name, start_time, end_time, created_at, updated_at)
VALUES ('Ca sáng', '08:00:00', '14:00:00', NOW(), NOW()),
       ('Ca chiều', '14:00:00', '22:00:00', NOW(), NOW());

INSERT INTO restaurant_tables (name, capacity, status, created_at, updated_at)
VALUES ('Bàn 01', 2, 'AVAILABLE', NOW(), NOW()),
       ('Bàn 02', 4, 'AVAILABLE', NOW(), NOW()),
       ('Bàn 03', 6, 'AVAILABLE', NOW(), NOW()),
       ('Bàn 04', 8, 'AVAILABLE', NOW(), NOW());

INSERT INTO categories (name, slug, description, created_at, updated_at)
VALUES ('Món súp', 'mon-sup', 'Các món súp', NOW(), NOW()),
       ('Món khai vị', 'mon-khai-vi', 'Các món khai vị', NOW(), NOW()),
       ('Món gà', 'mon-ga', 'Các món từ gà', NOW(), NOW()),
       ('Món bò', 'mon-bo', 'Các món từ bò', NOW(), NOW()),
       ('Món heo', 'mon-heo', 'Các món từ heo', NOW(), NOW()),
       ('Món lẩu', 'mon-lau', 'Các món lẩu', NOW(), NOW()),
       ('Món rau', 'mon-rau', 'Các món rau', NOW(), NOW()),
       ('Món hải sản', 'mon-hai-san', 'Các món hải sản', NOW(), NOW()),
       ('Đồ uống', 'do-uong', 'Nước uống', NOW(), NOW()),
       ('Tráng miệng', 'trang-mieng', 'Món tráng miệng', NOW(), NOW());

INSERT INTO items (name, description, image_url, price, price_after_discount, status, category_id, created_at,
                   updated_at)
VALUES ('Súp cua', 'Súp cua trứng', '/img/items/sup-cua.jpg', 35000.00, NULL, 'AVAILABLE', 1, NOW(), NOW()),
       ('Salad cá ngừ', 'Salad rau + cá ngừ', '/img/items/salad.jpg', 45000.00, NULL, 'AVAILABLE', 2, NOW(), NOW()),
       ('Gà chiên mắm', 'Gà chiên mắm tỏi', '/img/items/ga-mam.jpg', 89000.00, NULL, 'AVAILABLE', 3, NOW(), NOW()),
       ('Bò bít tết', 'Bò sốt tiêu đen', '/img/items/steak.jpg', 189000.00, NULL, 'AVAILABLE', 4, NOW(), NOW()),
       ( 'Heo quay', 'Heo quay giòn bì', '/img/items/heo-quay.jpg', 99000.00, NULL, 'AVAILABLE', 5, NOW(), NOW()),
       ('Lẩu thái', 'Lẩu thái hải sản', '/img/items/lau-thai.jpg', 229000.00, NULL, 'AVAILABLE', 6, NOW(), NOW()),
       ('Rau muống xào', 'Rau muống xào tỏi', '/img/items/rau-muong.jpg', 39000.00, NULL, 'AVAILABLE', 7, NOW(),
        NOW()),
       ('Tôm hấp', 'Tôm hấp sả', '/img/items/tom-hap.jpg', 159000.00, NULL, 'AVAILABLE', 8, NOW(), NOW()),
       ('Trà đào', 'Trà đào cam sả', '/img/items/peach-tea.jpg', 35000.00, NULL, 'AVAILABLE', 9, NOW(), NOW()),
       ('Coca', 'Nước ngọt', '/img/items/coke.jpg', 19000.00, NULL, 'AVAILABLE', 9, NOW(), NOW()),
       ('Bánh flan', 'Flan caramel', '/img/items/flan.jpg', 25000.00, NULL, 'AVAILABLE', 10, NOW(), NOW());


INSERT INTO combos (name, slug, description, price, price_after_discount, sold_count, status, created_at, updated_at)
VALUES
    ('Combo Lẩu Thái 2N', 'combo-lau-thai-2n', 'Lẩu Thái + Rau muống xào + 2 Coca', 306000.00, 289000.00, 20, 'AVAILABLE', NOW(), NOW()),
    ('Combo Gà Mắm Nhẹ Nhàng', 'combo-ga-mam-nhe-nhang', 'Gà chiên mắm + Salad cá ngừ + Trà đào', 169000.00, 159000.00, 35, 'AVAILABLE', NOW(), NOW()),
    ('Combo Beef Steak Set', 'combo-beef-steak-set', 'Bò bít tết + Súp cua + Coca', 243000.00, 229000.00, 12, 'AVAILABLE', NOW(), NOW()),
    ('Combo Hải Sản Healthy', 'combo-hai-san-healthy', 'Tôm hấp + Salad cá ngừ + Trà đào', 239000.00, 219000.00, 18, 'AVAILABLE', NOW(), NOW()),
    ('Combo Tráng Miệng Chill', 'combo-trang-mieng-chill', 'Bánh flan + Trà đào', 60000.00, 55000.00, 50, 'AVAILABLE', NOW(), NOW());


INSERT INTO combo_items (combo_id, item_id, quantity, created_at, updated_at)
VALUES
-- Combo 1: Lẩu thái + rau muống + 2 coca
(1, 6, 1, NOW(), NOW()),
(1, 7, 1, NOW(), NOW()),
(1, 10, 2, NOW(), NOW()),

-- Combo 2: gà mắm + salad + trà đào
(2, 3, 1, NOW(), NOW()),
(2, 2, 1, NOW(), NOW()),
(2, 9, 1, NOW(), NOW()),

-- Combo 3: steak + súp + coca
(3, 4, 1, NOW(), NOW()),
(3, 1, 1, NOW(), NOW()),
(3, 10, 1, NOW(), NOW()),

-- Combo 4: tôm hấp + salad + trà đào
(4, 8, 1, NOW(), NOW()),
(4, 2, 1, NOW(), NOW()),
(4, 9, 1, NOW(), NOW()),

-- Combo 5: flan + trà đào
(5, 11, 1, NOW(), NOW()),
(5, 9, 1, NOW(), NOW());

INSERT INTO vouchers (name, code, description, type, discount_value, max_discount_value, created_at, updated_at)
VALUES
    ('Giảm 10%', 'CD10', 'Giảm 10% tổng bill', 'PERCENTAGE', 10.00, 50000.00, NOW(), NOW()),
    ('Giảm 50K', 'CD50K', 'Giảm thẳng 50.000đ', 'FIXED_AMOUNT', 50000.00, NULL, NOW(), NOW()),
    ('Giảm 10% - 2', 'CD10-2', 'Giảm 10% (đợt 2) - name trùng vẫn OK', 'PERCENTAGE', 10.00, 30000.00, NOW(), NOW());


-- Thêm cột id vào danh sách cột
INSERT INTO users (id, username, password, avatar_url, email, first_name, last_name, date_of_birth, gender, status, phone, created_at, updated_at)
VALUES
-- Gán cứng ID = 1
(1, 'johndoe', '$2a$10$s3go5e.GYivSMmrJXG6jceddjfSAbg6O832Sip8XIVNRRLIjXNP6G', '/img/avatars/john.png', 'johndoe@gmail.com', 'John', 'Doe', '2002-05-10', 'MALE', 'ACTIVE', '0912345678', NOW(), NOW()),
-- Gán cứng ID = 2
(2, 'alice', '$2a$10$EeSehs49igNMz6Vuk69cDuaAGHFrWSjeOvMmNkaAr6ZwyZtltKStS', '/img/avatars/alice.png', '0901dattran@gmail.com', 'Alice', 'Nguyen', '2003-05-14', 'FEMALE', 'ACTIVE', '0913443344', NOW(), NOW()),
-- Gán cứng ID = 3
(3, 'johncena', '$2a$10$llGgE5VlZzM0.pCzbOLGWev.cqdovrjSsq0lGM87wo0FVgATXsh12', '/img/avatars/cena.png', 'johncena@gmail.com', 'John', 'Cena', '1998-05-14', 'MALE', 'ACTIVE', '0913324344', NOW(), NOW());

INSERT INTO user_roles (user_id, role_id)
VALUES (1, 1),
       (1, 2),
       (1, 3),
       (2, 2),
       (2, 3),
       (3, 3);

INSERT INTO user_vouchers (customer_id, voucher_id, created_at, updated_at)
VALUES (2, 1, NOW(), NOW()),
       (2, 2, NOW(), NOW()),
       (3, 1, NOW(), NOW());

INSERT INTO reservations
(customer_id, restaurant_table_id, date, start_time, end_time, guest_number, note, status, created_at, updated_at)
VALUES
    (2, 3, DATE_ADD(CURDATE(), INTERVAL 1 DAY),  '19:00:00', '20:30:00', 4, 'Sinh nhật', 'CONFIRMED', NOW(), NOW()),
    (3, 2, DATE_ADD(CURDATE(), INTERVAL 2 DAY),  '18:00:00', '19:00:00', 2, NULL,       'PENDING',   NOW(), NOW());

INSERT INTO orders
(user_id, reservation_id, restaurant_table_id, voucher_id, total_price, discount_price, final_price, status, created_at, updated_at)
VALUES
-- Order gắn với reservation 1
(2, 1, 3, 1, 318000.00, 30000.00, 288000.00, 'PENDING', NOW(), NOW()),
-- Order walk-in (không reservation), gắn table 2
(3, NULL, 2, 2, 239000.00, 50000.00, 189000.00, 'SERVED', NOW(), NOW());

-- DỮ LIỆU SEED CHO DASHBOARD: HÔM NAY, HÔM QUA, 7 NGÀY QUA, THÁNG NÀY, THÁNG TRƯỚC
-- Lưu ý: Sử dụng CURDATE() và DATE_SUB() để dữ liệu luôn phản ánh đúng theo thời điểm hiện tại khi chạy script.

-- 1. HÔM NAY (TODAY): Các mốc thời gian từ 7g-22g
INSERT INTO orders (user_id, reservation_id, restaurant_table_id, voucher_id, total_price, discount_price, final_price, status, created_at, updated_at) VALUES
(2, NULL, 1, NULL, 150000.00, 0, 150000.00, 'COMPLETED', CONCAT(CURDATE(), ' 07:30:00'), CONCAT(CURDATE(), ' 07:30:00')),
(3, NULL, 2, NULL, 280000.00, 0, 280000.00, 'COMPLETED', CONCAT(CURDATE(), ' 09:15:00'), CONCAT(CURDATE(), ' 09:15:00')),
(1, NULL, 3, NULL, 550000.00, 0, 550000.00, 'COMPLETED', CONCAT(CURDATE(), ' 12:45:00'), CONCAT(CURDATE(), ' 12:45:00')),
(2, NULL, 4, NULL, 320000.00, 0, 320000.00, 'COMPLETED', CONCAT(CURDATE(), ' 15:20:00'), CONCAT(CURDATE(), ' 15:20:00')),
(3, NULL, 1, NULL, 850000.00, 0, 850000.00, 'COMPLETED', CONCAT(CURDATE(), ' 18:50:00'), CONCAT(CURDATE(), ' 18:50:00')),
(1, NULL, 2, NULL, 620000.00, 0, 620000.00, 'COMPLETED', CONCAT(CURDATE(), ' 21:10:00'), CONCAT(CURDATE(), ' 21:10:00')),
(2, NULL, 3, NULL, 400000.00, 0, 400000.00, 'SERVED',    CONCAT(CURDATE(), ' 19:30:00'), CONCAT(CURDATE(), ' 19:30:00'));

-- 2. HÔM QUA (YESTERDAY): Các mốc thời gian từ 8g-22g
INSERT INTO orders (user_id, reservation_id, restaurant_table_id, voucher_id, total_price, discount_price, final_price, status, created_at, updated_at) VALUES
(1, NULL, 1, NULL, 200000.00, 0, 200000.00, 'COMPLETED', CONCAT(DATE_SUB(CURDATE(), INTERVAL 1 DAY), ' 08:00:00'), CONCAT(DATE_SUB(CURDATE(), INTERVAL 1 DAY), ' 08:00:00')),
(2, NULL, 2, NULL, 420000.00, 0, 420000.00, 'COMPLETED', CONCAT(DATE_SUB(CURDATE(), INTERVAL 1 DAY), ' 11:30:00'), CONCAT(DATE_SUB(CURDATE(), INTERVAL 1 DAY), ' 11:30:00')),
(3, NULL, 3, NULL, 350000.00, 0, 350000.00, 'COMPLETED', CONCAT(DATE_SUB(CURDATE(), INTERVAL 1 DAY), ' 14:00:00'), CONCAT(DATE_SUB(CURDATE(), INTERVAL 1 DAY), ' 14:00:00')),
(1, NULL, 4, NULL, 620000.00, 0, 620000.00, 'COMPLETED', CONCAT(DATE_SUB(CURDATE(), INTERVAL 1 DAY), ' 17:00:00'), CONCAT(DATE_SUB(CURDATE(), INTERVAL 1 DAY), ' 17:00:00')),
(2, NULL, 1, NULL, 950000.00, 0, 950000.00, 'COMPLETED', CONCAT(DATE_SUB(CURDATE(), INTERVAL 1 DAY), ' 19:30:00'), CONCAT(DATE_SUB(CURDATE(), INTERVAL 1 DAY), ' 19:30:00')),
(3, NULL, 2, NULL, 580000.00, 0, 580000.00, 'COMPLETED', CONCAT(DATE_SUB(CURDATE(), INTERVAL 1 DAY), ' 21:45:00'), CONCAT(DATE_SUB(CURDATE(), INTERVAL 1 DAY), ' 21:45:00'));

-- 3. 7 NGÀY QUA (LAST 7 DAYS - Không tính hôm nay và hôm qua)
INSERT INTO orders (user_id, reservation_id, restaurant_table_id, voucher_id, total_price, discount_price, final_price, status, created_at, updated_at) VALUES
(1, NULL, 1, NULL, 1200000.00, 0, 1200000.00, 'COMPLETED', CONCAT(DATE_SUB(CURDATE(), INTERVAL 2 DAY), ' 12:00:00'), CONCAT(DATE_SUB(CURDATE(), INTERVAL 2 DAY), ' 12:00:00')),
(2, NULL, 2, NULL, 1500000.00, 0, 1500000.00, 'COMPLETED', CONCAT(DATE_SUB(CURDATE(), INTERVAL 3 DAY), ' 13:00:00'), CONCAT(DATE_SUB(CURDATE(), INTERVAL 3 DAY), ' 13:00:00')),
(3, NULL, 3, NULL, 900000.00,  0, 900000.00,  'COMPLETED', CONCAT(DATE_SUB(CURDATE(), INTERVAL 4 DAY), ' 18:00:00'), CONCAT(DATE_SUB(CURDATE(), INTERVAL 4 DAY), ' 18:00:00')),
(1, NULL, 4, NULL, 1800000.00, 0, 1800000.00, 'COMPLETED', CONCAT(DATE_SUB(CURDATE(), INTERVAL 5 DAY), ' 19:00:00'), CONCAT(DATE_SUB(CURDATE(), INTERVAL 5 DAY), ' 19:00:00')),
(2, NULL, 1, NULL, 1100000.00, 0, 1100000.00, 'COMPLETED', CONCAT(DATE_SUB(CURDATE(), INTERVAL 6 DAY), ' 12:00:00'), CONCAT(DATE_SUB(CURDATE(), INTERVAL 6 DAY), ' 12:00:00'));

-- 4. THÁNG NÀY (THIS MONTH - Các ngày đầu tháng)
INSERT INTO orders (user_id, reservation_id, restaurant_table_id, voucher_id, total_price, discount_price, final_price, status, created_at, updated_at) VALUES
(1, NULL, 2, NULL, 2500000.00, 0, 2500000.00, 'COMPLETED', CONCAT(LAST_DAY(DATE_SUB(CURDATE(), INTERVAL 1 MONTH)) + INTERVAL 1 DAY, ' 12:00:00'), CONCAT(LAST_DAY(DATE_SUB(CURDATE(), INTERVAL 1 MONTH)) + INTERVAL 1 DAY, ' 12:00:00')),
(3, NULL, 3, NULL, 3200000.00, 0, 3200000.00, 'COMPLETED', CONCAT(LAST_DAY(DATE_SUB(CURDATE(), INTERVAL 1 MONTH)) + INTERVAL 5 DAY, ' 18:00:00'), CONCAT(LAST_DAY(DATE_SUB(CURDATE(), INTERVAL 1 MONTH)) + INTERVAL 5 DAY, ' 18:00:00'));

-- 5. THÁNG TRƯỚC (LAST MONTH): Một vài ngày cố định
INSERT INTO orders (user_id, reservation_id, restaurant_table_id, voucher_id, total_price, discount_price, final_price, status, created_at, updated_at) VALUES
(1, NULL, 1, NULL, 1000000.00, 0, 1000000.00, 'COMPLETED', CONCAT(DATE_SUB(LAST_DAY(DATE_SUB(CURDATE(), INTERVAL 1 MONTH)), INTERVAL 25 DAY), ' 12:00:00'), CONCAT(DATE_SUB(LAST_DAY(DATE_SUB(CURDATE(), INTERVAL 1 MONTH)), INTERVAL 25 DAY), ' 12:00:00')),
(2, NULL, 2, NULL, 1200000.00, 0, 1200000.00, 'COMPLETED', CONCAT(DATE_SUB(LAST_DAY(DATE_SUB(CURDATE(), INTERVAL 1 MONTH)), INTERVAL 15 DAY), ' 13:00:00'), CONCAT(DATE_SUB(LAST_DAY(DATE_SUB(CURDATE(), INTERVAL 1 MONTH)), INTERVAL 15 DAY), ' 13:00:00')),
(3, NULL, 3, NULL, 1800000.00, 0, 1800000.00, 'COMPLETED', CONCAT(DATE_SUB(LAST_DAY(DATE_SUB(CURDATE(), INTERVAL 1 MONTH)), INTERVAL 10 DAY), ' 18:00:00'), CONCAT(DATE_SUB(LAST_DAY(DATE_SUB(CURDATE(), INTERVAL 1 MONTH)), INTERVAL 10 DAY), ' 18:00:00')),
(1, NULL, 4, NULL, 2200000.00, 0, 2200000.00, 'COMPLETED', CONCAT(DATE_SUB(LAST_DAY(DATE_SUB(CURDATE(), INTERVAL 1 MONTH)), INTERVAL 5 DAY),  ' 19:00:00'), CONCAT(DATE_SUB(LAST_DAY(DATE_SUB(CURDATE(), INTERVAL 1 MONTH)), INTERVAL 5 DAY),  ' 19:00:00')),
(2, NULL, 1, NULL, 1500000.00, 0, 1500000.00, 'COMPLETED', CONCAT(DATE_SUB(LAST_DAY(DATE_SUB(CURDATE(), INTERVAL 1 MONTH)), INTERVAL 1 DAY),  ' 20:00:00'), CONCAT(DATE_SUB(LAST_DAY(DATE_SUB(CURDATE(), INTERVAL 1 MONTH)), INTERVAL 1 DAY),  ' 20:00:00'));

INSERT INTO order_details
(order_id, item_id, combo_id, quantity, total_price, note, created_at, updated_at)
VALUES
-- Order 1: gọi món lẻ
(1, 6,  NULL, 1, 229000.00, 'Ít cay', NOW(), NOW()),
(1, 7,  NULL, 1,  39000.00, NULL,    NOW(), NOW()),
(1, 9,  NULL, 1,  35000.00, 'Ít đá', NOW(), NOW()),
(1, 11, NULL, 1,  25000.00, NULL,    NOW(), NOW()),

-- Order 2: gọi combo
(2, NULL, 4,   1, 219000.00, 'Không hành', NOW(), NOW()),
-- thêm 1 coca lẻ
(2, 10, NULL,  1,  19000.00, NULL, NOW(), NOW());

-- DATA CHO TOP PRODUCTS (Order Details cho các đơn dashboard)
INSERT INTO order_details (order_id, item_id, combo_id, quantity, total_price, created_at, updated_at) VALUES
-- Hôm nay (Orders 3-9)
(3, 4, NULL, 1, 150000.00, CONCAT(CURDATE(), ' 07:30:00'), CONCAT(CURDATE(), ' 07:30:00')),  -- Bò bít tết
(4, 3, NULL, 2, 280000.00, CONCAT(CURDATE(), ' 09:15:00'), CONCAT(CURDATE(), ' 09:15:00')),  -- Gà chiên mắm
(5, 6, NULL, 1, 550000.00, CONCAT(CURDATE(), ' 12:45:00'), CONCAT(CURDATE(), ' 12:45:00')),  -- Lẩu thái
(6, 8, NULL, 2, 320000.00, CONCAT(CURDATE(), ' 15:20:00'), CONCAT(CURDATE(), ' 15:20:00')),  -- Tôm hấp
(7, 1, NULL, 1, 35000.00, CONCAT(CURDATE(), ' 18:50:00'), CONCAT(CURDATE(), ' 18:50:00')),   -- Súp cua (MỚI)
(7, 2, NULL, 1, 45000.00, CONCAT(CURDATE(), ' 18:50:00'), CONCAT(CURDATE(), ' 18:50:00')),   -- Salad (MỚI)
(7, 9, NULL, 2, 70000.00, CONCAT(CURDATE(), ' 18:50:00'), CONCAT(CURDATE(), ' 18:50:00')),   -- Trà đào (MỚI)
(8, 3, NULL, 5, 620000.00, CONCAT(CURDATE(), ' 21:10:00'), CONCAT(CURDATE(), ' 21:10:00')),  -- Gà chiên mắm
(9, 6, NULL, 2, 400000.00, CONCAT(CURDATE(), ' 19:30:00'), CONCAT(CURDATE(), ' 19:30:00')),  -- Lẩu thái

-- Hôm qua (Orders 10-15)
(10, 4, NULL, 2, 200000.00, CONCAT(DATE_SUB(CURDATE(), INTERVAL 1 DAY), ' 08:00:00'), CONCAT(DATE_SUB(CURDATE(), INTERVAL 1 DAY), ' 08:00:00')),
(11, 3, NULL, 4, 420000.00, CONCAT(DATE_SUB(CURDATE(), INTERVAL 1 DAY), ' 11:30:00'), CONCAT(DATE_SUB(CURDATE(), INTERVAL 1 DAY), ' 11:30:00')),
(12, 6, NULL, 1, 350000.00, CONCAT(DATE_SUB(CURDATE(), INTERVAL 1 DAY), ' 14:00:00'), CONCAT(DATE_SUB(CURDATE(), INTERVAL 1 DAY), ' 14:00:00')),
(13, 8, NULL, 4, 620000.00, CONCAT(DATE_SUB(CURDATE(), INTERVAL 1 DAY), ' 17:00:00'), CONCAT(DATE_SUB(CURDATE(), INTERVAL 1 DAY), ' 17:00:00')),
(14, 5, NULL, 3, 300000.00, CONCAT(DATE_SUB(CURDATE(), INTERVAL 1 DAY), ' 19:30:00'), CONCAT(DATE_SUB(CURDATE(), INTERVAL 1 DAY), ' 19:30:00')), -- Heo quay (MỚI)
(15, 7, NULL, 5, 195000.00, CONCAT(DATE_SUB(CURDATE(), INTERVAL 1 DAY), ' 21:45:00'), CONCAT(DATE_SUB(CURDATE(), INTERVAL 1 DAY), ' 21:45:00')), -- Rau muống (MỚI)
(15, 10, NULL, 5, 95000.00, CONCAT(DATE_SUB(CURDATE(), INTERVAL 1 DAY), ' 21:45:00'), CONCAT(DATE_SUB(CURDATE(), INTERVAL 1 DAY), ' 21:45:00')), -- Coca (MỚI)

-- 7 ngày qua (Orders 16-20)
(16, 4, NULL, 3, 567000.00, CONCAT(DATE_SUB(CURDATE(), INTERVAL 2 DAY), ' 12:00:00'), CONCAT(DATE_SUB(CURDATE(), INTERVAL 2 DAY), ' 12:00:00')),
(16, 11, NULL, 2, 50000.00, CONCAT(DATE_SUB(CURDATE(), INTERVAL 2 DAY), ' 12:00:00'), CONCAT(DATE_SUB(CURDATE(), INTERVAL 2 DAY), ' 12:00:00')), -- Bánh flan (MỚI)
(17, NULL, 1, 2, 578000.00, CONCAT(DATE_SUB(CURDATE(), INTERVAL 3 DAY), ' 13:00:00'), CONCAT(DATE_SUB(CURDATE(), INTERVAL 3 DAY), ' 13:00:00')), -- Combo 1 (MỚI)
(18, NULL, 2, 1, 159000.00, CONCAT(DATE_SUB(CURDATE(), INTERVAL 4 DAY), ' 18:00:00'), CONCAT(DATE_SUB(CURDATE(), INTERVAL 4 DAY), ' 18:00:00')), -- Combo 2 (MỚI)
(19, NULL, 3, 1, 229000.00, CONCAT(DATE_SUB(CURDATE(), INTERVAL 5 DAY), ' 19:00:00'), CONCAT(DATE_SUB(CURDATE(), INTERVAL 5 DAY), ' 19:00:00')), -- Combo 3 (MỚI)
(20, NULL, 4, 1, 219000.00, CONCAT(DATE_SUB(CURDATE(), INTERVAL 6 DAY), ' 12:00:00'), CONCAT(DATE_SUB(CURDATE(), INTERVAL 6 DAY), ' 12:00:00')), -- Combo 4 (MỚI)

-- Tháng này (Orders 21-22)
(21, 6, NULL, 8, 2500000.00, CONCAT(LAST_DAY(DATE_SUB(CURDATE(), INTERVAL 1 MONTH)) + INTERVAL 1 DAY, ' 12:00:00'), CONCAT(LAST_DAY(DATE_SUB(CURDATE(), INTERVAL 1 MONTH)) + INTERVAL 1 DAY, ' 12:00:00')),
(22, 4, NULL, 15, 3200000.00, CONCAT(LAST_DAY(DATE_SUB(CURDATE(), INTERVAL 1 MONTH)) + INTERVAL 5 DAY, ' 18:00:00'), CONCAT(LAST_DAY(DATE_SUB(CURDATE(), INTERVAL 1 MONTH)) + INTERVAL 5 DAY, ' 18:00:00')),

-- Tháng trước (Orders 23-27)
(23, 3, NULL, 10, 1000000.00, CONCAT(DATE_SUB(LAST_DAY(DATE_SUB(CURDATE(), INTERVAL 1 MONTH)), INTERVAL 25 DAY), ' 12:00:00'), CONCAT(DATE_SUB(LAST_DAY(DATE_SUB(CURDATE(), INTERVAL 1 MONTH)), INTERVAL 25 DAY), ' 12:00:00')),
(24, 6, NULL, 4, 1200000.00, CONCAT(DATE_SUB(LAST_DAY(DATE_SUB(CURDATE(), INTERVAL 1 MONTH)), INTERVAL 15 DAY), ' 13:00:00'), CONCAT(DATE_SUB(LAST_DAY(DATE_SUB(CURDATE(), INTERVAL 1 MONTH)), INTERVAL 15 DAY), ' 13:00:00')),
(25, 8, NULL, 12, 1800000.00, CONCAT(DATE_SUB(LAST_DAY(DATE_SUB(CURDATE(), INTERVAL 1 MONTH)), INTERVAL 10 DAY), ' 18:00:00'), CONCAT(DATE_SUB(LAST_DAY(DATE_SUB(CURDATE(), INTERVAL 1 MONTH)), INTERVAL 10 DAY), ' 18:00:00')),
(26, 4, NULL, 15, 2200000.00, CONCAT(DATE_SUB(LAST_DAY(DATE_SUB(CURDATE(), INTERVAL 1 MONTH)), INTERVAL 5 DAY),  ' 19:00:00'), CONCAT(DATE_SUB(LAST_DAY(DATE_SUB(CURDATE(), INTERVAL 1 MONTH)), INTERVAL 5 DAY),  ' 19:00:00')),
(27, 3, NULL, 15, 1500000.00, CONCAT(DATE_SUB(LAST_DAY(DATE_SUB(CURDATE(), INTERVAL 1 MONTH)), INTERVAL 1 DAY),  ' 20:00:00'), CONCAT(DATE_SUB(LAST_DAY(DATE_SUB(CURDATE(), INTERVAL 1 MONTH)), INTERVAL 1 DAY),  ' 20:00:00'));

INSERT INTO payments
(reservation_id, order_id, user_id, source, target, type, method, status, amount, transaction_code, created_at, updated_at)
VALUES
    (1, NULL, 3, 'CLIENT_APP', 'RESERVATION', 'DEPOSIT', 'PAYOS', 'SUCCESS', 100000.00, 'RSV-DEPOSIT-0001', NOW(), NOW()),
    (NULL, 2, 2, 'POS_COUNTER', 'ORDER', 'SETTLEMENT', 'CASH', 'SUCCESS', 189000.00, 'ORD-SETTLE-0002', NOW(), NOW());

INSERT INTO work_schedules (staff_id, shift_id, status, work_date, note, created_at, updated_at)
VALUES
    (2, 1, 'APPROVED', '2026-02-28', NULL, NOW(), NOW()),
    (2, 2, 'APPROVED', '2026-02-28', NULL, NOW(), NOW());

INSERT INTO attendances (work_schedule_id, check_in_at, check_out_at, note, created_at, updated_at)
VALUES
    (1, '2026-02-28 08:05:00', '2026-02-28 14:00:00', 'Đúng giờ', NOW(), NOW()),
    (2, '2026-02-28 14:10:00', NULL, 'Bận xử lý khách đông', NOW(), NOW());

INSERT INTO feedbacks (user_id, item_id, rating, comment, created_at, updated_at) VALUES
                                                                                          (2, 6, 5, 'Lẩu ngon, nước đậm vị', NOW(), NOW()),
                                                                                          (3, 8, 4, 'Tôm tươi, hơi ít',      NOW(), NOW()),
                                                                                          (2, 11, 5, 'Flan mềm, vừa ngọt',   NOW(), NOW());

INSERT INTO reviews (customer_id, comment, created_at, updated_at) VALUES
                                                              (3, 'Không gian ổn, phục vụ nhanh', NOW(), NOW()),
                                                              (2 ,'Món ăn hợp khẩu vị',           NOW(), NOW());