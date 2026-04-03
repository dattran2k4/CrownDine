-- Đồng bộ các thay đổi schema mới từ nhánh dev sang migration cho môi trường prod.

-- 1) Bổ sung cột audit cho các bảng đang sử dụng AbstractEntity hoặc đã được chuẩn hoá audit.
ALTER TABLE `floors` ADD COLUMN `created_by` VARCHAR(255) NULL, ADD COLUMN `updated_by` VARCHAR(255) NULL;
ALTER TABLE `areas` ADD COLUMN `created_by` VARCHAR(255) NULL, ADD COLUMN `updated_by` VARCHAR(255) NULL;
ALTER TABLE `banners` ADD COLUMN `created_by` VARCHAR(255) NULL, ADD COLUMN `updated_by` VARCHAR(255) NULL;
ALTER TABLE `categories` ADD COLUMN `created_by` VARCHAR(255) NULL, ADD COLUMN `updated_by` VARCHAR(255) NULL;
ALTER TABLE `combos` ADD COLUMN `created_by` VARCHAR(255) NULL, ADD COLUMN `updated_by` VARCHAR(255) NULL;
ALTER TABLE `restaurant_tables` ADD COLUMN `created_by` VARCHAR(255) NULL, ADD COLUMN `updated_by` VARCHAR(255) NULL;
ALTER TABLE `roles` ADD COLUMN `created_by` VARCHAR(255) NULL, ADD COLUMN `updated_by` VARCHAR(255) NULL;
ALTER TABLE `shifts` ADD COLUMN `created_by` VARCHAR(255) NULL, ADD COLUMN `updated_by` VARCHAR(255) NULL;
ALTER TABLE `users` ADD COLUMN `created_by` VARCHAR(255) NULL, ADD COLUMN `updated_by` VARCHAR(255) NULL;
ALTER TABLE `vouchers` ADD COLUMN `created_by` VARCHAR(255) NULL, ADD COLUMN `updated_by` VARCHAR(255) NULL;
ALTER TABLE `items` ADD COLUMN `created_by` VARCHAR(255) NULL, ADD COLUMN `updated_by` VARCHAR(255) NULL;
ALTER TABLE `reservations` ADD COLUMN `created_by` VARCHAR(255) NULL, ADD COLUMN `updated_by` VARCHAR(255) NULL;
ALTER TABLE `tokens` ADD COLUMN `created_by` VARCHAR(255) NULL, ADD COLUMN `updated_by` VARCHAR(255) NULL;
ALTER TABLE `user_vouchers` ADD COLUMN `created_by` VARCHAR(255) NULL, ADD COLUMN `updated_by` VARCHAR(255) NULL;
ALTER TABLE `work_schedules` ADD COLUMN `created_by` VARCHAR(255) NULL, ADD COLUMN `updated_by` VARCHAR(255) NULL;
ALTER TABLE `attendances` ADD COLUMN `created_by` VARCHAR(255) NULL, ADD COLUMN `updated_by` VARCHAR(255) NULL;
ALTER TABLE `combo_items` ADD COLUMN `created_by` VARCHAR(255) NULL, ADD COLUMN `updated_by` VARCHAR(255) NULL;
ALTER TABLE `feedbacks` ADD COLUMN `created_by` VARCHAR(255) NULL, ADD COLUMN `updated_by` VARCHAR(255) NULL;
ALTER TABLE `orders` ADD COLUMN `created_by` VARCHAR(255) NULL, ADD COLUMN `updated_by` VARCHAR(255) NULL;
ALTER TABLE `payments` ADD COLUMN `created_by` VARCHAR(255) NULL, ADD COLUMN `updated_by` VARCHAR(255) NULL;
ALTER TABLE `order_details` ADD COLUMN `created_by` VARCHAR(255) NULL, ADD COLUMN `updated_by` VARCHAR(255) NULL;
ALTER TABLE `reviews` ADD COLUMN `created_by` VARCHAR(255) NULL, ADD COLUMN `updated_by` VARCHAR(255) NULL;
ALTER TABLE `chat_conversations` ADD COLUMN `created_by` VARCHAR(255) NULL, ADD COLUMN `updated_by` VARCHAR(255) NULL;
ALTER TABLE `chat_messages` ADD COLUMN `created_by` VARCHAR(255) NULL, ADD COLUMN `updated_by` VARCHAR(255) NULL;
ALTER TABLE `favorites` ADD COLUMN `created_by` VARCHAR(255) NULL, ADD COLUMN `updated_by` VARCHAR(255) NULL;
ALTER TABLE `notifications` ADD COLUMN `created_by` VARCHAR(255) NULL, ADD COLUMN `updated_by` VARCHAR(255) NULL;
ALTER TABLE `point_histories` ADD COLUMN `created_by` VARCHAR(255) NULL, ADD COLUMN `updated_by` VARCHAR(255) NULL;

-- 2) Bổ sung lý do hủy đơn hàng.
ALTER TABLE `orders` ADD COLUMN `cancel_reason` VARCHAR(255) NULL;
ALTER TABLE `reservations` ADD COLUMN `guest_phone` VARCHAR(15) NULL AFTER `guest_name`;

-- 3) Hỗ trợ đăng nhập Google: google_id unique, phone/password cho phép NULL.
ALTER TABLE `users`
    ADD COLUMN `google_id` VARCHAR(255) NULL AFTER `phone`,
    MODIFY COLUMN `phone` VARCHAR(11) NULL,
    MODIFY COLUMN `password` VARCHAR(255) NULL;

ALTER TABLE `users`
    ADD CONSTRAINT `uk_users_google_id` UNIQUE (`google_id`);
