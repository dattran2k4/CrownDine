INSERT INTO roles (name, description, created_at, updated_at)
VALUES ('ADMIN', 'Quản trị hệ thống', NOW(), NOW()),
       ('STAFF', 'Nhân viên nhà hàng', NOW(), NOW()),
       ('USER', 'Khách hàng', NOW(), NOW());

INSERT INTO shifts (name, start_time, end_time, created_at, updated_at)
VALUES ('Ca sáng', '08:00:00', '14:00:00', NOW(), NOW()),
       ('Ca chiều', '14:00:00', '22:00:00', NOW(), NOW());

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

INSERT INTO items (name, description, image_url, price, price_after_discount, sold_count, status, category_id, created_at, updated_at)
VALUES 
-- Category 1: Món súp
('Súp hải sản', 'Súp hải sản thập cẩm', 'https://i.pinimg.com/1200x/c9/28/5f/c9285f6cea90c7d15589744e4785342b.jpg', 45000.00, NULL, 0, 'AVAILABLE', 1, NOW(), NOW()),
('Súp măng tây', 'Súp măng tây cua', 'https://i.pinimg.com/1200x/25/37/2f/25372fd3ef6b6a0f9c8075525ee1139e.jpg', 40000.00, NULL, 0, 'AVAILABLE', 1, NOW(), NOW()),
('Súp bắp cua', 'Súp bắp ngọt nấu cua', 'https://i.pinimg.com/1200x/62/67/81/62678184ece7e348cdc70e94ba7de0a7.jpg', 38000.00, NULL, 0, 'AVAILABLE', 1, NOW(), NOW()),
('Súp nấm', 'Súp nấm đông cô', 'https://i.pinimg.com/1200x/10/21/7a/10217a55916c7426846a5ef8590cfab0.jpg', 35000.00, NULL, 0, 'AVAILABLE', 1, NOW(), NOW()),
('Súp bào ngư', 'Súp bào ngư thượng hạng', 'https://i.pinimg.com/736x/12/d1/2a/12d12a8ecc5b9972dd0cd9aa3ac96a44.jpg', 150000.00, NULL, 0, 'AVAILABLE', 1, NOW(), NOW()),
('Súp vi cá', 'Súp vi cá mập', 'https://i.pinimg.com/1200x/fe/3d/a7/fe3da75d24af16a81a268b477b18702b.jpg', 250000.00, NULL, 0, 'AVAILABLE', 1, NOW(), NOW()),
('Súp lươn', 'Súp lươn Nghệ An', 'https://i.pinimg.com/1200x/ca/ef/13/caef13c04721da62d476ada41d0e1cf2.jpg', 55000.00, NULL, 0, 'AVAILABLE', 1, NOW(), NOW()),
('Súp gà', 'Súp gà xé phay', 'https://i.pinimg.com/736x/d4/dc/9d/d4dc9dcb7355d9bf7b12b094ef5d9e6d.jpg', 35000.00, NULL, 0, 'AVAILABLE', 1, NOW(), NOW()),
('Súp tôm bí đỏ', 'Súp kem bí đỏ tôm tươi', 'https://i.pinimg.com/1200x/ba/20/30/ba203044b185c6d10b838fe640c9eab9.jpg', 45000.00, NULL, 0, 'AVAILABLE', 1, NOW(), NOW()),

-- Category 2: Món khai vị
('Nem rán', 'Nem rán truyền thống', 'https://i.pinimg.com/1200x/d1/98/7a/d1987add813a9784ae9a949e36c880e6.jpg', 50000.00, NULL, 0, 'AVAILABLE', 2, NOW(), NOW()),
('Phở cuốn', 'Phở cuốn Hà Nội', 'https://i.pinimg.com/736x/9d/89/bf/9d89bf1de9faa62e1e5fc772cdd4340b.jpg', 60000.00, NULL, 0, 'AVAILABLE', 2, NOW(), NOW()),
('Gỏi ngó sen', 'Gỏi ngó sen tôm thịt', 'https://i.pinimg.com/1200x/f8/eb/b8/f8ebb880d3c815684aacb4ec14e73090.jpg', 75000.00, NULL, 0, 'AVAILABLE', 2, NOW(), NOW()),
('Khoai tây chiên', 'Khoai tây chiên bơ tỏi', 'https://i.pinimg.com/736x/cc/41/0c/cc410c5e28d49d1a8d7f940115f61aa0.jpg', 30000.00, NULL, 0, 'AVAILABLE', 2, NOW(), NOW()),
('Ngô chiên', 'Ngô ngọt chiên bơ', 'https://i.pinimg.com/736x/92/50/b7/9250b7e4c48bf4fa8d5c941801ffc4a7.jpg', 35000.00, NULL, 0, 'AVAILABLE', 2, NOW(), NOW()),
('Nộm sứa', 'Nộm sứa biển giòn', 'https://i.pinimg.com/736x/84/5b/d1/845bd15d473b105c2b05aa23b6cd9e94.jpg', 65000.00, NULL, 0, 'AVAILABLE', 2, NOW(), NOW()),
('Gỏi xoài xanh tôm khô', 'Gỏi xoài chua ngọt', 'https://i.pinimg.com/736x/84/1e/9a/841e9a160430a146489ce7a315597d18.jpg', 55000.00, NULL, 0, 'AVAILABLE', 2, NOW(), NOW()),
('Bánh gối', 'Bánh gối nhân thịt', 'https://i.pinimg.com/1200x/6c/04/48/6c0448c95271f24bc312b55e08a4168f.jpg', 45000.00, NULL, 0, 'AVAILABLE', 2, NOW(), NOW()),


-- Category 3: Món gà
('Gà rang muối', 'Gà ta rang muối', 'https://i.pinimg.com/1200x/7f/83/4b/7f834be50eb86d6dce49a5dd8b046023.jpg', 120000.00, NULL, 0, 'AVAILABLE', 3, NOW(), NOW()),
('Gà luộc', 'Gà ta luộc lá chanh', 'https://i.pinimg.com/1200x/98/92/bf/9892bf62bf6d1a7532c8932cca966817.jpg', 150000.00, NULL, 0, 'AVAILABLE', 3, NOW(), NOW()),
('Gà nướng mật ong', 'Gà nướng mật rừng', 'https://i.pinimg.com/1200x/40/e1/a4/40e1a4be26f1d292232f2efcd644c3ac.jpg', 180000.00, NULL, 0, 'AVAILABLE', 3, NOW(), NOW()),
('Cánh gà chiên bơ', 'Cánh gà chiên bơ tỏi', 'https://i.pinimg.com/1200x/8c/86/ac/8c86acc49c0ee90108340b25f7f75bee.jpg', 85000.00, NULL, 0, 'AVAILABLE', 3, NOW(), NOW()),
('Gà xào sả ớt', 'Gà ta xào sả ớt', 'https://i.pinimg.com/1200x/e9/9d/a0/e99da014eb1e1ab23f28f1216beac101.jpg', 110000.00, NULL, 0, 'AVAILABLE', 3, NOW(), NOW()),


-- Category 4: Món bò
('Bò xào cần tỏi', 'Bò thăn xào cần tỏi', 'https://i.pinimg.com/736x/3f/88/9c/3f889c6c40ddc0b23f2e16a433247488.jpg', 125000.00, NULL, 0, 'AVAILABLE', 4, NOW(), NOW()),
('Bò kho', 'Bò kho bánh mì', 'https://i.pinimg.com/1200x/ef/e2/25/efe225d8273ef8d329083032f2eb42ac.jpg', 85000.00, NULL, 0, 'AVAILABLE', 4, NOW(), NOW()),
('Bò sốt vang', 'Bò sốt vang tiêu đen', 'https://i.pinimg.com/736x/0f/b2/1e/0fb21e521317d6368ab89e5380bf4e4c.jpg', 95000.00, NULL, 0, 'AVAILABLE', 4, NOW(), NOW()),
('Bò tái chanh', 'Bò phi lê tái chanh', 'https://i.pinimg.com/736x/e6/a0/b7/e6a0b70c5421873a726cd6df5a6a701b.jpg', 115000.00, NULL, 0, 'AVAILABLE', 4, NOW(), NOW()),
('Bò lúc lắc', 'Bò khoai tây lúc lắc', 'https://i.pinimg.com/1200x/7e/71/59/7e7159e8f74e371f1d8eb08ed129135b.jpg', 145000.00, NULL, 0, 'AVAILABLE', 4, NOW(), NOW()),
('Bò né', 'Bò né bánh mì', 'https://i.pinimg.com/1200x/2f/fc/29/2ffc2938d7949d3c22bd90400caaad69.jpg', 75000.00, NULL, 0, 'AVAILABLE', 4, NOW(), NOW()),

-- Category 5: Món heo
('Thịt kho tàu', 'Thịt kho trứng cút', 'https://i.pinimg.com/1200x/b7/ca/63/b7ca63020574e612b6840228ab75df7c.jpg', 75000.00, NULL, 0, 'AVAILABLE', 5, NOW(), NOW()),
('Sườn xào chua ngọt', 'Sườn heo xào chua ngọt', 'https://i.pinimg.com/736x/57/a2/79/57a2795b9a3daea7e6ab94fe1e710776.jpg', 95000.00, NULL, 0, 'AVAILABLE', 5, NOW(), NOW()),
('Heo quay mắc mật', 'Lợn quay Lạng Sơn', 'https://i.pinimg.com/736x/d2/21/ab/d221abc68397445e1adb94dd957d6af6.jpg', 125000.00, NULL, 0, 'AVAILABLE', 5, NOW(), NOW()),
('Thịt ba chỉ luộc', 'Ba chỉ luộc mắm nêm', 'https://i.pinimg.com/736x/73/75/e8/7375e88f73014db0b4e15bee47a8f51b.jpg', 65000.00, NULL, 0, 'AVAILABLE', 5, NOW(), NOW()),
('Sườn nướng BBQ', 'Sườn tảng nướng sốt BBQ', 'https://i.pinimg.com/736x/3c/c6/02/3cc602f3711290c766c62cff34151a2c.jpg', 185000.00, NULL, 0, 'AVAILABLE', 5, NOW(), NOW()),

-- Category 6: Món lẩu
('Lẩu riêu cua bắp bò', 'Lẩu riêu cua bắp bò sườn sụn', 'https://i.pinimg.com/1200x/1e/19/62/1e19625b44f6834def46a34cef8b8343.jpg', 350000.00, NULL, 0, 'AVAILABLE', 6, NOW(), NOW()),
('Lẩu ếch măng chua', 'Lẩu ếch măng chua cay', 'https://i.pinimg.com/736x/66/29/ae/6629ae79ea685eca27f378f92179832b.jpg', 280000.00, NULL, 0, 'AVAILABLE', 6, NOW(), NOW()),
('Lẩu gà lá giang', 'Lẩu gà ta lá giang', 'https://i.pinimg.com/1200x/86/eb/5f/86eb5feeac92242706932f9528b1f1dc.jpg', 300000.00, NULL, 0, 'AVAILABLE', 6, NOW(), NOW()),


-- Category 7: Món rau
('Rau cải chíp xào nấm', 'Cải chíp xào nấm đông cô', 'https://i.pinimg.com/1200x/06/c8/fe/06c8fef2fef0e8ded09a4d7827188ad9.jpg', 45000.00, NULL, 0, 'AVAILABLE', 7, NOW(), NOW()),
('Nộm rau muống', 'Rau muống chẻ nộm', 'https://i.pinimg.com/736x/14/8a/87/148a879327cac28c629419d6e6d8a8dc.jpg', 35000.00, NULL, 0, 'AVAILABLE', 7, NOW(), NOW()),
('Cải thảo luộc', 'Cải thảo luộc chấm xì dầu', 'https://i.pinimg.com/736x/76/8e/c8/768ec8eddc3c214a58bf80ad40228a4f.jpg', 25000.00, NULL, 0, 'AVAILABLE', 7, NOW(), NOW()),
('Măng trúc xào tỏi', 'Măng trúc Yên Tử xào tỏi', 'https://i.pinimg.com/1200x/c6/dc/0b/c6dc0bd282e4562e5dee958768124b5f.jpg', 55000.00, NULL, 0, 'AVAILABLE', 7, NOW(), NOW()),
('Rau lang xào tỏi', 'Rau lang xào tỏi thơm', 'https://i.pinimg.com/736x/d1/98/d1/d198d1b85991a0eab1a01d840a4f60c6.jpg', 35000.00, NULL, 0, 'AVAILABLE', 7, NOW(), NOW()),

-- Category 8: Món hải sản
('Cua hấp bia', 'Cua thịt Cà Mau hấp bia', 'https://cdn.tgdd.vn/Files/2019/12/04/1224682/cach-hap-cua-bien-nhanh-thit-cua-ngon-ngot-khong-rung-cang-202202150958084999.jpg', 450000.00, NULL, 0, 'AVAILABLE', 8, NOW(), NOW()),
('Ghẹ rang me', 'Ghẹ xanh rang me chua ngọt', 'https://cdn.tgdd.vn/2021/03/CookProduct/1f-1200x676.jpg', 350000.00, NULL, 0, 'AVAILABLE', 8, NOW(), NOW()),
('Mực trứng chiên lá lốt', 'Mực trứng tươi chiên', 'https://cdn2.fptshop.com.vn/unsafe/muc_chien_la_lot_1_6c3796dd07.jpg', 185000.00, NULL, 0, 'AVAILABLE', 8, NOW(), NOW()),
('Hàu nướng mỡ hành', 'Hàu sữa nướng mỡ hành', 'https://sunhouse.com.vn/pic/news/images/1-mon-hau-nuong-mo-hanh-la-mon-an-duoc-rat-nhieu-nguoi-yeu-thich.jpeg', 120000.00, NULL, 0, 'AVAILABLE', 8, NOW(), NOW()),
('Cá tầm nướng', 'Cá tầm nướng muối ớt', 'https://www.nhahangquangon.com/wp-content/uploads/2014/09/ca-tam-nuong-muoi-ot-2-1.jpg', 280000.00, NULL, 0, 'AVAILABLE', 8, NOW(), NOW()),
('Bạch tuộc nướng sa tế', 'Bạch tuộc nướng cay', 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTs_gU2akmlTnMGCPfljMSMSdIn4L0FTwNehQ&s', 135000.00, NULL, 0, 'AVAILABLE', 8, NOW(), NOW()),

-- Category 9: Đồ uống
('Bia Hà Nội', 'Bia lon Hà Nội', 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQGl155U76-Q8Zv4_1hYQR5YRrpX9MEMHmunw&s', 18000.00, NULL, 0, 'AVAILABLE', 9, NOW(), NOW()),
('Bia Sài Gòn', 'Bia Sài Gòn Special', 'https://product.hstatic.net/200000352097/product/8935012413321_94fa330d96f54deca13ba043e250ac94_grande.jpg', 22000.00, NULL, 0, 'AVAILABLE', 9, NOW(), NOW()),
('Bia Heineken', 'Bia Heineken lon', 'https://cdnv2.tgdd.vn/bhx-static/bhx/production/2025/12/image/Products/Images/2282/201265/bhx/bia-heineken-250ml_202512301337028701.jpg', 25000.00, NULL, 0, 'AVAILABLE', 9, NOW(), NOW()),
('Pepsi', 'Nước ngọt Pepsi lon', 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTJcAe6O3Ei2szlnLUU69mWWynZ5z4ih7q0sQ&s', 15000.00, NULL, 0, 'AVAILABLE', 9, NOW(), NOW()),
('7Up', 'Nước ngọt 7Up lon', 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTW4rW8JeyK5JkZuJrVsfQ3Q361koDYNloRDQ&s', 15000.00, NULL, 0, 'AVAILABLE', 9, NOW(), NOW()),
('Mirinda', 'Nước ngọt Mirinda cam lon', 'https://cdn.tgdd.vn/Products/Images/2443/79140/bhx/nuoc-ngot-mirinda-huong-cam-lon-320ml-202312252142544474.jpg', 15000.00, NULL, 0, 'AVAILABLE', 9, NOW(), NOW()),
('Rượu Macallan 12', 'Single Malt Scotch Whisky', 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQ3WBZpDIPr1pSmvkRNLfDjG7Cg05o-U_hBww&s', 2500000.00, NULL, 0, 'AVAILABLE', 9, NOW(), NOW()),
('Rượu Chivas 18', 'Blended Scotch Whisky 18 Years', 'https://ruoungoai68.com/wp-content/uploads/2024/01/ruou-chivas-18-nam-1-lit-03.jpg', 1800000.00, NULL, 0, 'AVAILABLE', 9, NOW(), NOW()),
('Rượu Hennessy VSOP', 'Cognac Hennessy Pháp', 'https://ruouvip.vn/wp-content/uploads/2023/03/ruou-hennessy-vsop-privilege-4.jpg', 1600000.00, NULL, 0, 'AVAILABLE', 9, NOW(), NOW()),

-- Category 10: Tráng miệng
('Chè thái', 'Chè thái sầu riêng', 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRakTkV9vNNJPlN2OQjSABESf0MSKAYX2f1-g&s', 35000.00, NULL, 0, 'AVAILABLE', 10, NOW(), NOW()),
('Chè bưởi', 'Chè bưởi An Giang', 'https://dayphache.edu.vn/wp-content/uploads/2021/05/thanh-pham-che-buoi-dep-mat.jpg', 25000.00, NULL, 0, 'AVAILABLE', 10, NOW(), NOW()),
('Rau câu dừa', 'Rau câu trái dừa tươi', 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSBKYzTjXv2lbGXoNgyh1fYARjYI2MPQrtKUg&s', 40000.00, NULL, 0, 'AVAILABLE', 10, NOW(), NOW()),
('Rót rượu 1', 'Sản phẩm thượng hạng', 'https://i.pinimg.com/736x/d6/04/dc/d604dcb4323fba50b4febad3cb6eca5d.jpg', 500000.00, NULL, 0, 'AVAILABLE', 10, NOW(), NOW()),
('Rót rượu 2', 'Sản phẩm thượng hạng', 'https://i.pinimg.com/736x/67/15/3d/67153d73a15557a1553bfb0ca7e14089.jpg', 500000.00, NULL, 0, 'AVAILABLE', 10, NOW(), NOW()),
('Rót rượu 3', 'Sản phẩm thượng hạng', 'https://i.pinimg.com/1200x/d1/72/53/d172538ffbb66c7be362718a279b9dc0.jpg', 500000.00, NULL, 0, 'AVAILABLE', 10, NOW(), NOW()),
('Kem bơ', 'Kem bơ Đà Lạt', 'https://eggyolk.vn/wp-content/uploads/2025/03/Cach-lam-kem-bo-bang-may-ep-cham.jpg', 45000.00, NULL, 0, 'AVAILABLE', 10, NOW(), NOW());


INSERT INTO combos (name, slug, description, image_url, price, price_after_discount, sold_count, status, created_at, updated_at)
VALUES
    ('Combo Tiệc Lẩu Riêu', 'combo-tiec-lau-rieu', 'Lẩu riêu cua bắp bò + Nem rán + Rau lang xào tỏi + 2 Bia Hà Nội', 'https://i.pinimg.com/736x/2e/8c/86/2e8c8656396c2b471d4d8eef93585908.jpg', 471000.00, 429000.00, 15, 'AVAILABLE', NOW(), NOW()),
    ('Combo Gà Ngon Hấp Dẫn', 'combo-ga-ngon-hap-dan', 'Gà rang muối + Phở cuốn + Nộm rau muống + 2 Pepsi', 'https://i.pinimg.com/736x/2e/8c/86/2e8c8656396c2b471d4d8eef93585908.jpg', 245000.00, 219000.00, 28, 'AVAILABLE', NOW(), NOW()),
    ('Combo Nhậu Hải Sản', 'combo-nhau-hai-san', 'Cua hấp bia + Bạch tuộc nướng sa tế + 4 Bia Sài Gòn', 'https://i.pinimg.com/736x/2e/8c/86/2e8c8656396c2b471d4d8eef93585908.jpg', 673000.00, 599000.00, 10, 'AVAILABLE', NOW(), NOW()),
    ('Combo Bò Cao Cấp', 'combo-bo-cao-cap', 'Bò lúc lắc + Súp bào ngư + Rượu Macallan 12', 'https://i.pinimg.com/736x/2e/8c/86/2e8c8656396c2b471d4d8eef93585908.jpg', 2795000.00, 2649000.00, 5, 'AVAILABLE', NOW(), NOW()),
    ('Combo Tráng Miệng Chill', 'combo-trang-mieng-chill', 'Chè thái + Kem bơ + 2 Mirinda', 'https://i.pinimg.com/736x/2e/8c/86/2e8c8656396c2b471d4d8eef93585908.jpg', 110000.00, 99000.00, 45, 'AVAILABLE', NOW(), NOW());


INSERT INTO combo_items (combo_id, item_id, quantity, created_at, updated_at)
VALUES
-- Combo 1: Lẩu riêu (34) + Nem rán (10) + Rau lang (41) + 2 Bia HN (48)
(1, 34, 1, NOW(), NOW()),
(1, 10, 1, NOW(), NOW()),
(1, 41, 1, NOW(), NOW()),
(1, 48, 2, NOW(), NOW()),

-- Combo 2: Gà rang muối (18) + Phở cuốn (11) + Nộm rau muống (38) + 2 Pepsi (51)
(2, 18, 1, NOW(), NOW()),
(2, 11, 1, NOW(), NOW()),
(2, 38, 1, NOW(), NOW()),
(2, 51, 2, NOW(), NOW()),

-- Combo 3: Cua hấp bia (42) + Bạch tuộc nướng sa tế (47) + 4 Bia SG (49)
(3, 42, 1, NOW(), NOW()),
(3, 47, 1, NOW(), NOW()),
(3, 49, 4, NOW(), NOW()),

-- Combo 4: Bò lúc lắc (27) + Súp bào ngư (5) + Rượu Macallan 12 (54)
(4, 27, 1, NOW(), NOW()),
(4, 5, 1, NOW(), NOW()),
(4, 54, 1, NOW(), NOW()),

-- Combo 5: Chè thái (57) + Kem bơ (63) + 2 Mirinda (53)
(5, 57, 1, NOW(), NOW()),
(5, 63, 1, NOW(), NOW()),
(5, 53, 2, NOW(), NOW());

INSERT INTO vouchers (name, code, description, type, discount_value, max_discount_value, created_at, updated_at)
VALUES
    ('Giảm 10%', 'CD10', 'Giảm 10% tổng bill', 'PERCENTAGE', 10.00, 50000.00, NOW(), NOW()),
    ('Giảm 50K', 'CD50K', 'Giảm thẳng 50.000đ', 'FIXED_AMOUNT', 50000.00, NULL, NOW(), NOW()),
    ('Giảm 10% - 2', 'CD10-2', 'Giảm 10% (đợt 2) - name trùng vẫn OK', 'PERCENTAGE', 10.00, 30000.00, NOW(), NOW());


-- Thêm cột id vào danh sách cột
INSERT INTO users (id, username, password, avatar_url, email, first_name, last_name, date_of_birth, gender, status, phone, created_at, updated_at)
VALUES
-- Gán cứng ID = 1
(1, 'johndoe', '$2a$10$s3go5e.GYivSMmrJXG6jceddjfSAbg6O832Sip8XIVNRRLIjXNP6G', 'https://i.pinimg.com/736x/49/15/d1/4915d11ef3a6a8e2e1245fa46c16a8a2.jpg', 'johndoe@gmail.com', 'John', 'Doe', '2002-05-10', 'MALE', 'ACTIVE', '0912345678', NOW(), NOW()),
-- Gán cứng ID = 2
(2, 'alice', '$2a$10$EeSehs49igNMz6Vuk69cDuaAGHFrWSjeOvMmNkaAr6ZwyZtltKStS', 'https://i.pinimg.com/736x/07/16/a8/0716a8e465a5a2e9a8e78f37c0b8cd9c.jpg', '0901dattran@gmail.com', 'Alice', 'Nguyen', '2003-05-14', 'FEMALE', 'ACTIVE', '0913443344', NOW(), NOW()),
-- Gán cứng ID = 3
(3, 'johncena', '$2a$10$llGgE5VlZzM0.pCzbOLGWev.cqdovrjSsq0lGM87wo0FVgATXsh12', 'https://i.pinimg.com/736x/90/fd/19/90fd1986c9cff08c20eacbaf7045dd9c.jpg', 'johncena@gmail.com', 'John', 'Cena', '1998-05-14', 'MALE', 'ACTIVE', '0913324344', NOW(), NOW());

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
    (2, NULL, DATE_ADD(CURDATE(), INTERVAL 1 DAY),  '19:00:00', '20:30:00', 4, 'Sinh nhật', 'CONFIRMED', NOW(), NOW()),
    (3, NULL, DATE_ADD(CURDATE(), INTERVAL 2 DAY),  '18:00:00', '19:00:00', 2, NULL,       'PENDING',   NOW(), NOW());

INSERT INTO orders
(user_id, reservation_id, restaurant_table_id, voucher_id, total_price, discount_price, final_price, status, created_at, updated_at)
VALUES
-- Order gắn với reservation 1
(2, 1, NULL, 1, 318000.00, 30000.00, 288000.00, 'CONFIRMED', NOW(), NOW()),
-- Order walk-in (không reservation), gắn table 2
(3, NULL, NULL, 2, 239000.00, 50000.00, 189000.00, 'CONFIRMED', NOW(), NOW());

-- DỮ LIỆU SEED CHO DASHBOARD: HÔM NAY, HÔM QUA, 7 NGÀY QUA, THÁNG NÀY, THÁNG TRƯỚC
-- Lưu ý: Sử dụng CURDATE() và DATE_SUB() để dữ liệu luôn phản ánh đúng theo thời điểm hiện tại khi chạy script.

-- 1. HÔM NAY (TODAY): Các mốc thời gian từ 7g-22g
INSERT INTO orders (user_id, reservation_id, restaurant_table_id, voucher_id, total_price, discount_price, final_price, status, created_at, updated_at) VALUES
(2, NULL, NULL, NULL, 150000.00, 0, 150000.00, 'COMPLETED', CONCAT(CURDATE(), ' 07:30:00'), CONCAT(CURDATE(), ' 07:30:00')),
(3, NULL, NULL, NULL, 280000.00, 0, 280000.00, 'COMPLETED', CONCAT(CURDATE(), ' 09:15:00'), CONCAT(CURDATE(), ' 09:15:00')),
(1, NULL, NULL, NULL, 550000.00, 0, 550000.00, 'COMPLETED', CONCAT(CURDATE(), ' 12:45:00'), CONCAT(CURDATE(), ' 12:45:00')),
(2, NULL, NULL, NULL, 320000.00, 0, 320000.00, 'COMPLETED', CONCAT(CURDATE(), ' 15:20:00'), CONCAT(CURDATE(), ' 15:20:00')),
(3, NULL, NULL, NULL, 850000.00, 0, 850000.00, 'COMPLETED', CONCAT(CURDATE(), ' 18:50:00'), CONCAT(CURDATE(), ' 18:50:00')),
(1, NULL, NULL, NULL, 620000.00, 0, 620000.00, 'COMPLETED', CONCAT(CURDATE(), ' 21:10:00'), CONCAT(CURDATE(), ' 21:10:00')),
(2, NULL, NULL, NULL, 400000.00, 0, 400000.00, 'COMPLETED',    CONCAT(CURDATE(), ' 19:30:00'), CONCAT(CURDATE(), ' 19:30:00'));

-- 2. HÔM QUA (YESTERDAY): Các mốc thời gian từ 8g-22g
INSERT INTO orders (user_id, reservation_id, restaurant_table_id, voucher_id, total_price, discount_price, final_price, status, created_at, updated_at) VALUES
(1, NULL, NULL, NULL, 200000.00, 0, 200000.00, 'COMPLETED', CONCAT(DATE_SUB(CURDATE(), INTERVAL 1 DAY), ' 08:00:00'), CONCAT(DATE_SUB(CURDATE(), INTERVAL 1 DAY), ' 08:00:00')),
(2, NULL, NULL, NULL, 420000.00, 0, 420000.00, 'COMPLETED', CONCAT(DATE_SUB(CURDATE(), INTERVAL 1 DAY), ' 11:30:00'), CONCAT(DATE_SUB(CURDATE(), INTERVAL 1 DAY), ' 11:30:00')),
(3, NULL, NULL, NULL, 350000.00, 0, 350000.00, 'COMPLETED', CONCAT(DATE_SUB(CURDATE(), INTERVAL 1 DAY), ' 14:00:00'), CONCAT(DATE_SUB(CURDATE(), INTERVAL 1 DAY), ' 14:00:00')),
(1, NULL, NULL, NULL, 620000.00, 0, 620000.00, 'COMPLETED', CONCAT(DATE_SUB(CURDATE(), INTERVAL 1 DAY), ' 17:00:00'), CONCAT(DATE_SUB(CURDATE(), INTERVAL 1 DAY), ' 17:00:00')),
(2, NULL, NULL, NULL, 950000.00, 0, 950000.00, 'COMPLETED', CONCAT(DATE_SUB(CURDATE(), INTERVAL 1 DAY), ' 19:30:00'), CONCAT(DATE_SUB(CURDATE(), INTERVAL 1 DAY), ' 19:30:00')),
(3, NULL, NULL, NULL, 580000.00, 0, 580000.00, 'COMPLETED', CONCAT(DATE_SUB(CURDATE(), INTERVAL 1 DAY), ' 21:45:00'), CONCAT(DATE_SUB(CURDATE(), INTERVAL 1 DAY), ' 21:45:00'));

-- 3. 7 NGÀY QUA (LAST 7 DAYS - Không tính hôm nay và hôm qua)
INSERT INTO orders (user_id, reservation_id, restaurant_table_id, voucher_id, total_price, discount_price, final_price, status, created_at, updated_at) VALUES
(1, NULL, NULL, NULL, 1200000.00, 0, 1200000.00, 'COMPLETED', CONCAT(DATE_SUB(CURDATE(), INTERVAL 2 DAY), ' 12:00:00'), CONCAT(DATE_SUB(CURDATE(), INTERVAL 2 DAY), ' 12:00:00')),
(2, NULL, NULL, NULL, 1500000.00, 0, 1500000.00, 'COMPLETED', CONCAT(DATE_SUB(CURDATE(), INTERVAL 3 DAY), ' 13:00:00'), CONCAT(DATE_SUB(CURDATE(), INTERVAL 3 DAY), ' 13:00:00')),
(3, NULL, NULL, NULL, 900000.00,  0, 900000.00,  'COMPLETED', CONCAT(DATE_SUB(CURDATE(), INTERVAL 4 DAY), ' 18:00:00'), CONCAT(DATE_SUB(CURDATE(), INTERVAL 4 DAY), ' 18:00:00')),
(1, NULL, NULL, NULL, 1800000.00, 0, 1800000.00, 'COMPLETED', CONCAT(DATE_SUB(CURDATE(), INTERVAL 5 DAY), ' 19:00:00'), CONCAT(DATE_SUB(CURDATE(), INTERVAL 5 DAY), ' 19:00:00')),
(2, NULL, NULL, NULL, 1100000.00, 0, 1100000.00, 'COMPLETED', CONCAT(DATE_SUB(CURDATE(), INTERVAL 6 DAY), ' 12:00:00'), CONCAT(DATE_SUB(CURDATE(), INTERVAL 6 DAY), ' 12:00:00'));

-- 4. THÁNG NÀY (THIS MONTH - Các ngày đầu tháng)
INSERT INTO orders (user_id, reservation_id, restaurant_table_id, voucher_id, total_price, discount_price, final_price, status, created_at, updated_at) VALUES
(1, NULL, NULL, NULL, 2500000.00, 0, 2500000.00, 'COMPLETED', CONCAT(LAST_DAY(DATE_SUB(CURDATE(), INTERVAL 1 MONTH)) + INTERVAL 1 DAY, ' 12:00:00'), CONCAT(LAST_DAY(DATE_SUB(CURDATE(), INTERVAL 1 MONTH)) + INTERVAL 1 DAY, ' 12:00:00')),
(3, NULL, NULL, NULL, 3200000.00, 0, 3200000.00, 'COMPLETED', CONCAT(LAST_DAY(DATE_SUB(CURDATE(), INTERVAL 1 MONTH)) + INTERVAL 5 DAY, ' 18:00:00'), CONCAT(LAST_DAY(DATE_SUB(CURDATE(), INTERVAL 1 MONTH)) + INTERVAL 5 DAY, ' 18:00:00'));

-- 5. THÁNG TRƯỚC (LAST MONTH): Một vài ngày cố định
INSERT INTO orders (user_id, reservation_id, restaurant_table_id, voucher_id, total_price, discount_price, final_price, status, created_at, updated_at) VALUES
(1, NULL, NULL, NULL, 1000000.00, 0, 1000000.00, 'COMPLETED', CONCAT(DATE_SUB(LAST_DAY(DATE_SUB(CURDATE(), INTERVAL 1 MONTH)), INTERVAL 25 DAY), ' 12:00:00'), CONCAT(DATE_SUB(LAST_DAY(DATE_SUB(CURDATE(), INTERVAL 1 MONTH)), INTERVAL 25 DAY), ' 12:00:00')),
(2, NULL, NULL, NULL, 1200000.00, 0, 1200000.00, 'COMPLETED', CONCAT(DATE_SUB(LAST_DAY(DATE_SUB(CURDATE(), INTERVAL 1 MONTH)), INTERVAL 15 DAY), ' 13:00:00'), CONCAT(DATE_SUB(LAST_DAY(DATE_SUB(CURDATE(), INTERVAL 1 MONTH)), INTERVAL 15 DAY), ' 13:00:00')),
(3, NULL, NULL, NULL, 1800000.00, 0, 1800000.00, 'COMPLETED', CONCAT(DATE_SUB(LAST_DAY(DATE_SUB(CURDATE(), INTERVAL 1 MONTH)), INTERVAL 10 DAY), ' 18:00:00'), CONCAT(DATE_SUB(LAST_DAY(DATE_SUB(CURDATE(), INTERVAL 1 MONTH)), INTERVAL 10 DAY), ' 18:00:00')),
(1, NULL, NULL, NULL, 2200000.00, 0, 2200000.00, 'COMPLETED', CONCAT(DATE_SUB(LAST_DAY(DATE_SUB(CURDATE(), INTERVAL 1 MONTH)), INTERVAL 5 DAY),  ' 19:00:00'), CONCAT(DATE_SUB(LAST_DAY(DATE_SUB(CURDATE(), INTERVAL 1 MONTH)), INTERVAL 5 DAY),  ' 19:00:00')),
(2, NULL, NULL, NULL, 1500000.00, 0, 1500000.00, 'COMPLETED', CONCAT(DATE_SUB(LAST_DAY(DATE_SUB(CURDATE(), INTERVAL 1 MONTH)), INTERVAL 1 DAY),  ' 20:00:00'), CONCAT(DATE_SUB(LAST_DAY(DATE_SUB(CURDATE(), INTERVAL 1 MONTH)), INTERVAL 1 DAY),  ' 20:00:00'));

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
