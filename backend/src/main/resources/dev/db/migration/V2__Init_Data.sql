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
       ('Bàn 03', 6, 'RESERVED', NOW(), NOW()),
       ('Bàn 04', 8, 'UNAVAILABLE', NOW(), NOW());

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


INSERT INTO combos (name, slug, description, price, price_after_discount, sold_count, status, created_at,
                    updated_at)
VALUES ('Combo Lẩu Thái 2N', 'combo-lau-thai-2n', 'Lẩu Thái + Rau muống xào + 2 Coca', 306000.00, 289000.00, 20,
        'TEST', NOW(), NOW()),
       ('Combo Gà Mắm Nhẹ Nhàng', 'combo-ga-mam-nhe-nhang', 'Gà chiên mắm + Salad cá ngừ + Trà đào', 169000.00,
        159000.00, 35, 'TEST', NOW(), NOW()),
       ('Combo Beef Steak Set', 'combo-beef-steak-set', 'Bò bít tết + Súp cua + Coca', 243000.00, 229000.00, 12,
        'TEST', NOW(), NOW()),
       ('Combo Hải Sản Healthy', 'combo-hai-san-healthy', 'Tôm hấp + Salad cá ngừ + Trà đào', 239000.00, 219000.00,
        18, 'TEST', NOW(), NOW()),
       ('Combo Tráng Miệng Chill', 'combo-trang-mieng-chill', 'Bánh flan + Trà đào', 60000.00, 55000.00, 50, 'TEST',
        NOW(), NOW());

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
VALUES ('Giảm 10%', 'CD10', 'Giảm 10% tổng bill', 'PERCENTAGE', 10.00, 50000.00, NOW(), NOW()),
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
(2, 1, 3, 1, 318000.00, 30000.00, 288000.00, 'PENDING',  NOW(), NOW()),
-- Order walk-in (không reservation), gắn table 2
(3, NULL, 2, 2, 239000.00, 50000.00, 189000.00, 'SERVED', NOW(), NOW());

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

INSERT INTO payments
(reservation_id, order_id, target, type, method, status, amount, transaction_code, created_at, updated_at)
VALUES
-- Deposit cho reservation 1
(1, NULL, 'RESERVATION', 'DEPOSIT',    'CREDIT_CARD', 'SUCCESS', 100000.00, 'RSV-DEPOSIT-0001', NOW(), NOW()),
-- Settlement cho order 2
(NULL, 2, 'ORDER',       'SETTLEMENT', 'CASH',        'SUCCESS', 189000.00, 'ORD-SETTLE-0002',  NOW(), NOW());

INSERT INTO work_schedules (staff_id, shift_id, status, created_at, updated_at) VALUES
                                                                                        (2, 1, 'APPROVED', NOW(), NOW()),
                                                                                        (2, 2, 'APPROVED', NOW(), NOW());

INSERT INTO attendances (user_id, work_schedule_id, check_in_time, check_out_time, note, created_at, updated_at) VALUES
                                                                                                                         (2, 1, '08:05:00', '14:00:00', 'Đúng giờ', NOW(), NOW()),
                                                                                                                         (2, 2, '14:10:00', NULL,       'Bận xử lý khách đông', NOW(), NOW());

INSERT INTO feedbacks (user_id, item_id, rating, comment, created_at, updated_at) VALUES
                                                                                          (2, 6, 5, 'Lẩu ngon, nước đậm vị', NOW(), NOW()),
                                                                                          (3, 8, 4, 'Tôm tươi, hơi ít',      NOW(), NOW()),
                                                                                          (2, 11, 5, 'Flan mềm, vừa ngọt',   NOW(), NOW());

INSERT INTO reviews (customer_id, comment, created_at, updated_at) VALUES
                                                              (3, 'Không gian ổn, phục vụ nhanh', NOW(), NOW()),
                                                              (2 ,'Món ăn hợp khẩu vị',           NOW(), NOW());