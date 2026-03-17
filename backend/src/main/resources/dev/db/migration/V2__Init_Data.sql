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
VALUES ('Súp cua', 'Súp cua trứng', 'https://i.pinimg.com/736x/4a/2c/d1/4a2cd119b6f152413b7c10b3ae7cf459.jpg', 35000.00, NULL, 'AVAILABLE', 1, NOW(), NOW()),
       ('Salad cá ngừ', 'Salad rau + cá ngừ', 'https://i.pinimg.com/736x/f7/4c/5a/f74c5a8d2f2953e61b795ad4959d1c65.jpg', 45000.00, NULL, 'AVAILABLE', 2, NOW(), NOW()),
       ('Gà chiên mắm', 'Gà chiên mắm tỏi', 'https://i.pinimg.com/1200x/b8/4a/8c/b84a8cc788de61fed3ba499b2abd60fb.jpg', 89000.00, NULL, 'AVAILABLE', 3, NOW(), NOW()),
       ('Bò bít tết', 'Bò sốt tiêu đen', 'https://i.pinimg.com/736x/3c/b2/6e/3cb26eb0b32e52171c70c89b3eefc8c5.jpg', 189000.00, NULL, 'AVAILABLE', 4, NOW(), NOW()),
       ( 'Heo quay', 'Heo quay giòn bì', 'https://i.pinimg.com/1200x/13/79/5f/13795f112232d419a14cea773515b317.jpg', 99000.00, NULL, 'AVAILABLE', 5, NOW(), NOW()),
       ('Lẩu thái', 'Lẩu thái hải sản', 'https://i.pinimg.com/736x/06/89/5e/06895e407e2cd725e94a4f50de48e6f0.jpg', 229000.00, NULL, 'AVAILABLE', 6, NOW(), NOW()),
       ('Rau muống xào', 'Rau muống xào tỏi', 'https://i.pinimg.com/1200x/c4/8d/43/c48d4323e79b464f6d676c2273ac080f.jpg', 39000.00, NULL, 'AVAILABLE', 7, NOW(),
        NOW()),
       ('Tôm hấp', 'Tôm hấp sả', 'https://i.pinimg.com/736x/4b/44/24/4b44242fb1de137e5a551c590b7cf05d.jpg', 159000.00, NULL, 'AVAILABLE', 8, NOW(), NOW()),
       ('Trà đào', 'Trà đào cam sả', 'https://i.pinimg.com/1200x/d5/78/e3/d578e33d582430f8705d61021da968f5.jpg', 35000.00, NULL, 'AVAILABLE', 9, NOW(), NOW()),
       ('Coca', 'Nước ngọt', 'https://i.pinimg.com/1200x/a0/e5/a5/a0e5a566fcd9ebcf39687549489c0295.jpg', 19000.00, NULL, 'AVAILABLE', 9, NOW(), NOW()),
       ('Bánh flan', 'Flan caramel', 'https://i.pinimg.com/736x/93/af/35/93af35792cb4c4892173d0786cf95743.jpg', 25000.00, NULL, 'AVAILABLE', 10, NOW(), NOW());


INSERT INTO combos (name, slug, description, image_url, price, price_after_discount, sold_count, status, created_at, updated_at)
VALUES
    ('Combo Lẩu Thái 2N', 'combo-lau-thai-2n', 'Lẩu Thái + Rau muống xào + 2 Coca', 'https://i.pinimg.com/736x/2e/8c/86/2e8c8656396c2b471d4d8eef93585908.jpg', 306000.00, 289000.00, 20, 'AVAILABLE', NOW(), NOW()),
    ('Combo Gà Mắm Nhẹ Nhàng', 'combo-ga-mam-nhe-nhang', 'Gà chiên mắm + Salad cá ngừ + Trà đào', 'https://i.pinimg.com/736x/2e/8c/86/2e8c8656396c2b471d4d8eef93585908.jpg', 169000.00, 159000.00, 35, 'AVAILABLE', NOW(), NOW()),
    ('Combo Beef Steak Set', 'combo-beef-steak-set', 'Bò bít tết + Súp cua + Coca', 'https://i.pinimg.com/736x/2e/8c/86/2e8c8656396c2b471d4d8eef93585908.jpg', 243000.00, 229000.00, 12, 'AVAILABLE', NOW(), NOW()),
    ('Combo Hải Sản Healthy', 'combo-hai-san-healthy', 'Tôm hấp + Salad cá ngừ + Trà đào', 'https://i.pinimg.com/736x/2e/8c/86/2e8c8656396c2b471d4d8eef93585908.jpg', 239000.00, 219000.00, 18, 'AVAILABLE', NOW(), NOW()),
    ('Combo Tráng Miệng Chill', 'combo-trang-mieng-chill', 'Bánh flan + Trà đào', 'https://i.pinimg.com/736x/2e/8c/86/2e8c8656396c2b471d4d8eef93585908.jpg', 60000.00, 55000.00, 50, 'AVAILABLE', NOW(), NOW());


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
(1, 'johndoe', '$2a$10$s3go5e...', '/img/avatars/john.png', 'johndoe@gmail.com', 'John', 'Doe', '2002-05-10', 'MALE', 'ACTIVE', '0912345678', NOW(), NOW()),
-- Gán cứng ID = 2
(2, 'alice', '$2a$10$TTfo0Zpg...', '/img/avatars/alice.png', '0901dattran@gmail.com', 'Alice', 'Nguyen', '2003-05-14', 'FEMALE', 'ACTIVE', '0913443344', NOW(), NOW()),
-- Gán cứng ID = 3
(3, 'johncena', '$2a$10$bxaCEqc...', '/img/avatars/cena.png', 'johncena@gmail.com', 'John', 'Cena', '1998-05-14', 'MALE', 'ACTIVE', '0913324344', NOW(), NOW());

INSERT INTO users (id, username, password, avatar_url, email, first_name, last_name, date_of_birth, gender, status, phone, verification_code, verification_expiration, created_at, updated_at)
VALUES
(4, 'minhanh', '$2a$10$f8K0p/rAvE9SrsZcahthQuKA79pIAqGt9APO14f3.czxnCPp9q6Iu', NULL, 'minhanh@crowndine.local', 'Minh', 'Anh', '2001-03-12', 'FEMALE', 'ACTIVE', '0901100001', NULL, NULL, NOW(), NOW()),
(5, 'thutrang', '$2a$10$OEYH9he8BWJRnCytYVcmB.W4lk6WlwAHnAgVf9aQHZch5gJ.HUiAu', NULL, 'thutrang@crowndine.local', 'Thu', 'Trang', '2000-07-24', 'FEMALE', 'ACTIVE', '0901100002', NULL, NULL, NOW(), NOW()),
(6, 'quochuy', '$2a$10$2XGuYngpcuowaqhZbvTLGuhlNg5n3sn9GdbzQGyWcMvKm3G/FOZbS', NULL, 'quochuy@crowndine.local', 'Quoc', 'Huy', '1999-11-08', 'MALE', 'ACTIVE', '0901100003', NULL, NULL, NOW(), NOW()),
(7, 'ngocmai', '$2a$10$gYToj5teNH/bDuMaboswr.RCWyw3mnhxVw7fXYTRDVoeh/qy5eVdm', NULL, 'ngocmai@crowndine.local', 'Ngoc', 'Mai', '2002-01-19', 'FEMALE', 'ACTIVE', '0901100004', NULL, NULL, NOW(), NOW()),
(8, 'thanhtung', '$2a$10$XDav3qdVlNkr58OGZZVm7uGdQs4D9kAeqw555rq0lo6q6NG7EB87C', NULL, 'thanhtung@crowndine.local', 'Thanh', 'Tung', '1998-09-03', 'MALE', 'ACTIVE', '0901100005', NULL, NULL, NOW(), NOW()),
(9, 'baovy', '$2a$10$2/BYSYBiyru0TusrcILpHejPJXShhDUbLe4AhvAvX2Loy28hZuZzq', NULL, 'baovy@crowndine.local', 'Bao', 'Vy', '2003-06-15', 'FEMALE', 'ACTIVE', '0901100006', NULL, NULL, NOW(), NOW()),
(10, 'hoangyen', '$2a$10$k0Pe70Q6Ng7btefKDxPI9.g6dS5L/078.eb9ykojULQHrhj6QrEaG', NULL, 'hoangyen@crowndine.local', 'Hoang', 'Yen', '2001-12-02', 'FEMALE', 'ACTIVE', '0901100007', NULL, NULL, NOW(), NOW()),
(11, 'ductri', '$2a$10$RQhy/.FDwnIHKS7vUx6gBeFviqoEEfPe8dAQowIlwhBwUoanbtKJ.', NULL, 'ductri@crowndine.local', 'Duc', 'Tri', '1997-04-27', 'MALE', 'ACTIVE', '0901100008', NULL, NULL, NOW(), NOW()),
(12, 'kimngan', '$2a$10$/lnvxAHZOhbb0wjfK40LYeEyd.crr3ikTYemydilZW6JlTyDdOp9e', NULL, 'kimngan@crowndine.local', 'Kim', 'Ngan', '2004-08-14', 'FEMALE', 'ACTIVE', '0901100009', NULL, NULL, NOW(), NOW()),
(13, 'annhi', '$2a$10$V53.Yc2EmYI0byjNWMYgoOAHUCRSQrQ0D5gbwu8Kau.E8j9ajjBGG', NULL, 'annhi@crowndine.local', 'An', 'Nhi', '2002-10-09', 'FEMALE', 'INACTIVE', '0901100010', NULL, NULL, NOW(), NOW()),
(14, 'nguyenkhoa', '$2a$10$n8Pl2zirf/Gca5l8aTKQbuEGfol/MzgtbtXXInKkINtYbn37OX0v6', NULL, 'nguyenkhoa.staff@crowndine.local', 'Nguyen', 'Khoa', '1995-05-17', 'MALE', 'ACTIVE', '0902200001', NULL, NULL, NOW(), NOW()),
(15, 'thuyduong', '$2a$10$qPuhubmfya.dzZPjN7n8C.e7XkwhZEIs2NWc9duaRhJehMeJxbyT2', NULL, 'thuyduong.staff@crowndine.local', 'Thuy', 'Duong', '1996-02-11', 'FEMALE', 'ACTIVE', '0902200002', NULL, NULL, NOW(), NOW()),
(16, 'hoanglong', '$2a$10$xU6pg09xUTnIaiUY3EAGAO7DArkh0gGi7VXFIH7jomraEsOo4fp5q', NULL, 'hoanglong.staff@crowndine.local', 'Hoang', 'Long', '1997-09-22', 'MALE', 'ACTIVE', '0902200003', NULL, NULL, NOW(), NOW()),
(17, 'mylinh', '$2a$10$ER.uoSiYqEtSX.QmliHXHOMBFrCIGwYp6cgUxcgdAq7kSVgfZPohW', NULL, 'mylinh.staff@crowndine.local', 'My', 'Linh', '1998-01-30', 'FEMALE', 'ACTIVE', '0902200004', NULL, NULL, NOW(), NOW()),
(18, 'quanghuy', '$2a$10$sCOOYR47CI8tKPz0hGRceusjfeNYVcxnRnTcKsWikFPmLPy0rYWXG', NULL, 'quanghuy.staff@crowndine.local', 'Quang', 'Huy', '1999-07-06', 'MALE', 'ACTIVE', '0902200005', NULL, NULL, NOW(), NOW()),
(19, 'diemmy', '$2a$10$ymkp.wkR2qE8V9nlgYNKQe6xfFEpvlNhO3hwhryYnsqii0pqAaMpC', NULL, 'diemmy.staff@crowndine.local', 'Diem', 'My', '2000-03-28', 'FEMALE', 'ACTIVE', '0902200006', NULL, NULL, NOW(), NOW()),
(20, 'phuocan', '$2a$10$DFYEE5OIHU3QWgGaiWXt7OTV6zRtY.GDeq4zTnx3HtZdAeCK0KsCe', NULL, 'phuocan.staff@crowndine.local', 'Phuoc', 'An', '2001-11-13', 'MALE', 'ACTIVE', '0902200007', NULL, NULL, NOW(), NOW()),
(21, 'tramlam', '$2a$10$YAuhlJBlUbowaD.GhtuG3u962klwTxWWcKLthL5Xk868LXyHPepty', NULL, 'tramlam.staff@crowndine.local', 'Tram', 'Lam', '2003-04-16', 'FEMALE', 'ACTIVE', '0902200008', NULL, NULL, NOW(), NOW()),
(22, 'anhkiet', '$2a$10$1g8VX1G3WNLT.iei7k2.IeWfAQcajgeWqfL95.4Y4KO8AXMONbzW2', NULL, 'anhkiet.staff@crowndine.local', 'Anh', 'Kiet', '2005-08-21', 'MALE', 'ACTIVE', '0902200009', NULL, NULL, NOW(), NOW()),
(23, 'thanhha', '$2a$10$dZr/DYrilsusmew//sI45OQp0/CS.M10j82gkgVa8TdHMFTGhoKqq', NULL, 'thanhha.staff@crowndine.local', 'Thanh', 'Ha', '2006-12-05', 'FEMALE', 'INACTIVE', '0902200010', NULL, NULL, NOW(), NOW());

INSERT INTO user_roles (user_id, role_id)
VALUES (1, 1),
       (1, 2),
       (1, 3),
       (2, 2),
       (2, 3),
       (3, 3);

INSERT INTO user_roles (user_id, role_id)
VALUES (4, 3),
       (5, 3),
       (6, 3),
       (7, 3),
       (8, 3),
       (9, 3),
       (10, 3),
       (11, 3),
       (12, 3),
       (13, 3),
       (14, 2),
       (15, 2),
       (16, 2),
       (17, 2),
       (18, 2),
       (19, 2),
       (20, 2),
       (21, 2),
       (22, 2),
       (23, 2);

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
(2, 1, 3, 1, 318000.00, 30000.00, 288000.00, 'CONFIRMED', NOW(), NOW()),
-- Order walk-in (không reservation), gắn table 2
(3, NULL, 2, 2, 239000.00, 50000.00, 189000.00, 'CONFIRMED', NOW(), NOW());

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
(2, NULL, 3, NULL, 400000.00, 0, 400000.00, 'COMPLETED',    CONCAT(CURDATE(), ' 19:30:00'), CONCAT(CURDATE(), ' 19:30:00'));

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
