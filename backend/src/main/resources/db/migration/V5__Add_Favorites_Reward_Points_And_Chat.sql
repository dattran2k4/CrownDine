CREATE TABLE `favorites` (
    `id` bigint NOT NULL AUTO_INCREMENT,
    `user_id` bigint NOT NULL,
    `item_id` bigint DEFAULT NULL,
    `combo_id` bigint DEFAULT NULL,
    `created_at` datetime(6) DEFAULT NULL,
    `updated_at` datetime(6) DEFAULT NULL,
    PRIMARY KEY (`id`),
    KEY `idx_favorites_user_id` (`user_id`),
    KEY `idx_favorites_item_id` (`item_id`),
    KEY `idx_favorites_combo_id` (`combo_id`),
    CONSTRAINT `fk_favorites_user_id_users` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`),
    CONSTRAINT `fk_favorites_item_id_items` FOREIGN KEY (`item_id`) REFERENCES `items` (`id`),
    CONSTRAINT `fk_favorites_combo_id_combos` FOREIGN KEY (`combo_id`) REFERENCES `combos` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;

CREATE TABLE `point_histories` (
    `id` bigint NOT NULL AUTO_INCREMENT,
    `user_id` bigint NOT NULL,
    `points_changed` int NOT NULL,
    `reason` varchar(50) NOT NULL,
    `reference_id` bigint DEFAULT NULL,
    `created_at` datetime(6) DEFAULT NULL,
    `updated_at` datetime(6) DEFAULT NULL,
    PRIMARY KEY (`id`),
    KEY `idx_point_histories_user_id` (`user_id`),
    CONSTRAINT `fk_point_histories_user_id_users` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;

ALTER TABLE `users`
    ADD COLUMN `reward_points` int NOT NULL DEFAULT 0 AFTER `verification_expiration`;

ALTER TABLE `vouchers`
    ADD COLUMN `points_required` int DEFAULT NULL AFTER `max_discount_value`;

INSERT INTO `vouchers`
    (`name`, `code`, `type`, `discount_value`, `max_discount_value`, `description`, `points_required`, `created_at`, `updated_at`)
VALUES
    ('Voucher Điểm Thưởng 50K', 'REWARD50', 'FIXED_AMOUNT', 50000.00, 50000.00, 'Đổi 50 điểm lấy voucher giảm 50.000 VNĐ', 50, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('Voucher Điểm Thưởng 100K', 'REWARD100', 'FIXED_AMOUNT', 100000.00, 100000.00, 'Đổi 100 điểm lấy voucher giảm 100.000 VNĐ', 100, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('Voucher Điểm Thưởng 200K', 'REWARD200', 'FIXED_AMOUNT', 200000.00, 200000.00, 'Đổi 200 điểm lấy voucher giảm 200.000 VNĐ', 200, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('Voucher Điểm Thưởng 500K', 'REWARD500', 'FIXED_AMOUNT', 500000.00, 500000.00, 'Đổi 500 điểm lấy voucher giảm 500.000 VNĐ', 500, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

UPDATE `users` u
JOIN `user_roles` ur ON u.`id` = ur.`user_id`
JOIN `roles` r ON ur.`role_id` = r.`id`
SET u.`reward_points` = 5000
WHERE r.`name` IN ('ADMIN', 'STAFF');

CREATE TABLE `chat_conversations` (
    `id` bigint NOT NULL AUTO_INCREMENT,
    `created_at` datetime(6) DEFAULT NULL,
    `updated_at` datetime(6) DEFAULT NULL,
    `title` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
    `user_id` bigint NOT NULL,
    PRIMARY KEY (`id`),
    KEY `idx_chat_conversations_user_id` (`user_id`),
    CONSTRAINT `fk_chat_conversations_user_id` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `chat_messages` (
    `id` bigint NOT NULL AUTO_INCREMENT,
    `created_at` datetime(6) DEFAULT NULL,
    `updated_at` datetime(6) DEFAULT NULL,
    `role` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
    `content` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
    `model` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
    `conversation_id` bigint NOT NULL,
    PRIMARY KEY (`id`),
    KEY `idx_chat_messages_conversation_id` (`conversation_id`),
    CONSTRAINT `fk_chat_messages_conversation_id` FOREIGN KEY (`conversation_id`) REFERENCES `chat_conversations` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

ALTER TABLE `chat_conversations`
    CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

ALTER TABLE `chat_messages`
    CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

ALTER TABLE `chat_messages`
    MODIFY `content` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL;

ALTER TABLE `chat_conversations`
    MODIFY `title` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL;
