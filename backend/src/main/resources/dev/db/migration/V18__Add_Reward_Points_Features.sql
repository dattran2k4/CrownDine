CREATE TABLE point_histories (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    points_changed INT NOT NULL,
    reason VARCHAR(50) NOT NULL,
    reference_id BIGINT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    created_by VARCHAR(50),
    updated_by VARCHAR(50),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

ALTER TABLE users 
ADD COLUMN reward_points INT NOT NULL DEFAULT 0;

ALTER TABLE vouchers 
ADD COLUMN points_required INT;

-- Insert fixed reward vouchers
INSERT INTO vouchers (name, code, type, discount_value, max_discount_value, description, points_required, created_at, updated_at) VALUES 
('Voucher Điểm Thưởng 50K', 'REWARD50', 'FIXED_AMOUNT', 50000.00, 50000.00, 'Đổi 50 điểm lấy voucher giảm 50.000 VNĐ', 50, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('Voucher Điểm Thưởng 100K', 'REWARD100', 'FIXED_AMOUNT', 100000.00, 100000.00, 'Đổi 100 điểm lấy voucher giảm 100.000 VNĐ', 100, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('Voucher Điểm Thưởng 200K', 'REWARD200', 'FIXED_AMOUNT', 200000.00, 200000.00, 'Đổi 200 điểm lấy voucher giảm 200.000 VNĐ', 200, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('Voucher Điểm Thưởng 500K', 'REWARD500', 'FIXED_AMOUNT', 500000.00, 500000.00, 'Đổi 500 điểm lấy voucher giảm 500.000 VNĐ', 500, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

UPDATE users u
JOIN user_roles ur ON u.id = ur.user_id
JOIN roles r ON ur.role_id = r.id
SET u.reward_points = 5000
WHERE r.name IN ('ADMIN', 'STAFF');
