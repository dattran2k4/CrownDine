ALTER TABLE `vouchers`
    ADD COLUMN `min_value` decimal(38,2) DEFAULT NULL AFTER `max_discount_value`;

UPDATE `vouchers`
SET `min_value` = `discount_value` + 20000
WHERE `type` = 'FIXED_AMOUNT'
  AND `discount_value` IS NOT NULL
  AND `min_value` IS NULL;

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
ALTER TABLE `orders` ADD COLUMN `cancel_reason` VARCHAR(255) NULL;
