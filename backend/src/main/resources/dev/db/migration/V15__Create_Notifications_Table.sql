CREATE TABLE `notifications` (
    `id` bigint NOT NULL AUTO_INCREMENT,
    `user_id` bigint NOT NULL,
    `type` enum('VOUCHER_GRANTED','VOUCHER_EXPIRING_SOON','VOUCHER_EXPIRED','RESERVATION_CONFIRMED','RESERVATION_REMINDER') NOT NULL,
    `title` varchar(255) NOT NULL,
    `message` varchar(500) NOT NULL,
    `payload` json DEFAULT NULL,
    `read_at` datetime(6) DEFAULT NULL,
    `created_at` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    PRIMARY KEY (`id`),
    KEY `idx_notifications_user_id` (`user_id`),
    KEY `idx_notifications_type` (`type`),
    KEY `idx_notifications_read_at` (`read_at`),
    KEY `idx_notifications_created_at` (`created_at`),
    CONSTRAINT `fk_notifications_user_id_users` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;
