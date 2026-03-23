-- crowndine.favorites definition

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
