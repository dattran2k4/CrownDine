-- Add columns to support anonymous feedback and moderation
ALTER TABLE feedbacks
    ADD COLUMN guest_name VARCHAR(100) NULL,
    ADD COLUMN guest_email VARCHAR(255) NULL,
    ADD COLUMN is_featured BOOLEAN DEFAULT FALSE,
    ADD COLUMN status ENUM('PENDING', 'APPROVED', 'HIDDEN') DEFAULT 'APPROVED';

-- Add more sample feedback data
-- Linked to existing items and users from V2

-- Feedback for Combo Lẩu Thái (Combo ID 1) from existing Order Detail IDs if possible
-- Let's assume some IDs based on V2 insertion order (7-27 were for dashboard orders)

INSERT INTO feedbacks (rating, comment, item_id, user_id, is_featured, created_at, updated_at)
VALUES 
    (5, 'Không gian nhà hàng thực sự sang trọng. Tối qua tôi đã có một bữa tối tuyệt vời cùng gia đình. Bò bít tết sốt tiêu đen rất mềm và thơm!', 4, 2, TRUE, DATE_SUB(NOW(), INTERVAL 2 DAY), NOW()),
    (5, 'Lần đầu trải nghiệm tại CrownDine và tôi vô cùng ấn tượng. Phục vụ chu đáo, món Súp cua trứng bắc thảo rất đậm đà.', 1, 3, TRUE, DATE_SUB(NOW(), INTERVAL 5 DAY), NOW()),
    (4, 'Món gà chiên mắm rất ngon, da giòn rụm. Tuy nhiên quán hơi đông vào giờ cao điểm, nên đặt bàn trước.', 3, 1, TRUE, DATE_SUB(NOW(), INTERVAL 1 WEEK), NOW()),
    (5, 'Hải sản ở đây cực kỳ tươi. Tôm hấp sả giữ được vị ngọt tự nhiên. Sẽ quay lại nhiều lần nữa!', 8, 2, TRUE, DATE_SUB(NOW(), INTERVAL 3 DAY), NOW()),
    (5, 'Bánh flan caramel là món kết thúc bữa ăn hoàn hảo. Không quá ngọt, độ béo vừa phải. Tuyệt vời!', 11, 3, TRUE, DATE_SUB(NOW(), INTERVAL 1 DAY), NOW());

-- Add anonymous feedback
INSERT INTO feedbacks (rating, comment, item_id, guest_name, guest_email, is_featured, created_at, updated_at)
VALUES 
    (5, 'Thực đơn đa dạng, nhiều lựa chọn hấp dẫn. Một trong những nhà hàng tốt nhất mà tôi từng ghé thăm tại thành phố này.', 6, 'Nguyễn Văn A', 'vanna@example.com', TRUE, DATE_SUB(NOW(), INTERVAL 4 DAY), NOW());

-- Item 1: Súp cua (Already had some but let's add more)
INSERT INTO feedbacks (rating, comment, item_id, user_id, status, created_at, updated_at)
VALUES (4, 'Súp thanh đạm, rất vừa miệng.', 1, 1, 'APPROVED', NOW(), NOW());

-- Item 2: Salad cá ngừ
INSERT INTO feedbacks (rating, comment, item_id, user_id, status, created_at, updated_at)
VALUES (5, 'Cá ngừ tươi, sốt salad rất đặc biệt.', 2, 2, 'APPROVED', NOW(), NOW()),
       (4, 'Rau xanh giòn, cảm giác rất healthy.', 2, 3, 'APPROVED', NOW(), NOW());

-- Item 5: Heo quay
INSERT INTO feedbacks (rating, comment, item_id, user_id, status, created_at, updated_at)
VALUES (5, 'Da heo giòn tan, thịt mềm mọng nước.', 5, 1, 'APPROVED', NOW(), NOW()),
       (5, 'Món này ăn với cơm thì tuyệt vời.', 5, 2, 'APPROVED', NOW(), NOW());

-- Item 6: Lẩu thái (Already had some)
INSERT INTO feedbacks (rating, comment, item_id, user_id, status, created_at, updated_at)
VALUES (4, 'Nước lẩu hơi cay nhưng rất ngon.', 6, 1, 'APPROVED', NOW(), NOW());

-- Item 7: Rau muống xào
INSERT INTO feedbacks (rating, comment, item_id, user_id, status, created_at, updated_at)
VALUES (4, 'Rau muống xào tỏi thơm phức.', 7, 3, 'APPROVED', NOW(), NOW());

-- Item 9: Trà đào
INSERT INTO feedbacks (rating, comment, item_id, user_id, status, created_at, updated_at)
VALUES (5, 'Đào miếng to, trà thơm và không quá ngọt.', 9, 1, 'APPROVED', NOW(), NOW()),
       (4, 'Giải nhiệt rất tốt cho những ngày nóng.', 9, 2, 'APPROVED', NOW(), NOW());

-- Item 10: Coca
INSERT INTO feedbacks (rating, comment, item_id, user_id, status, created_at, updated_at)
VALUES (5, 'Coca mát lạnh, phục vụ nhanh.', 10, 3, 'APPROVED', NOW(), NOW());

-- Add feedbacks for Combos
-- Combo 1: Combo Lẩu Thái 2N
INSERT INTO feedbacks (rating, comment, combo_id, user_id, status, created_at, updated_at)
VALUES (5, 'Combo rất hời cho 2 người ăn, đủ no và ngon.', 1, 2, 'APPROVED', NOW(), NOW());

-- Combo 2: Combo Gà Mắm Nhẹ Nhàng
INSERT INTO feedbacks (rating, comment, combo_id, user_id, status, created_at, updated_at)
VALUES (4, 'Sự kết hợp hoàn hảo giữa gà và salad.', 2, 3, 'APPROVED', NOW(), NOW());

-- Combo 3: Combo Beef Steak Set
INSERT INTO feedbacks (rating, comment, combo_id, user_id, status, created_at, updated_at)
VALUES (5, 'Bít tết chín vừa, súp cua khai vị rất hợp.', 3, 1, 'APPROVED', NOW(), NOW());

-- Combo 4: Combo Hải Sản Healthy
INSERT INTO feedbacks (rating, comment, combo_id, user_id, status, created_at, updated_at)
VALUES (5, 'Hải sản tươi ngon, đúng chất healthy.', 4, 3, 'APPROVED', NOW(), NOW());

-- Combo 5: Combo Tráng Miệng Chill
INSERT INTO feedbacks (rating, comment, combo_id, user_id, status, created_at, updated_at)
VALUES (5, 'Combo tráng miệng rất chill cho buổi chiều.', 5, 2, 'APPROVED', NOW(), NOW());
