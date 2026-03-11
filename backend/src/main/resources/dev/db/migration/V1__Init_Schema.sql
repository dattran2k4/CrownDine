-- crowndine.categories definition

CREATE TABLE `categories` (
                              `created_at` datetime(6) DEFAULT NULL,
                              `id` bigint NOT NULL AUTO_INCREMENT,
                              `updated_at` datetime(6) DEFAULT NULL,
                              `description` varchar(255) DEFAULT NULL,
                              `name` varchar(255) DEFAULT NULL,
                              `slug` varchar(255) DEFAULT NULL,
                              PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;


-- crowndine.combos definition

CREATE TABLE `combos` (
                          `price` decimal(38,2) DEFAULT NULL,
                          `price_after_discount` decimal(38,2) DEFAULT NULL,
                          `created_at` datetime(6) DEFAULT NULL,
                          `id` bigint NOT NULL AUTO_INCREMENT,
                          `sold_count` bigint DEFAULT NULL,
                          `updated_at` datetime(6) DEFAULT NULL,
                          `description` varchar(255) DEFAULT NULL,
                          `name` varchar(255) DEFAULT NULL,
                          `slug` varchar(255) DEFAULT NULL,
                          `status` enum('AVAILABLE','UNAVAILABLE') DEFAULT NULL,
                          PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;


-- crowndine.restaurant_tables definition

CREATE TABLE `restaurant_tables` (
                                     `capacity` int DEFAULT NULL,
                                     `created_at` datetime(6) DEFAULT NULL,
                                     `id` bigint NOT NULL AUTO_INCREMENT,
                                     `updated_at` datetime(6) DEFAULT NULL,
                                     `name` varchar(255) DEFAULT NULL,
                                     `status` enum('AVAILABLE','OCCUPIED','RESERVED','UNAVAILABLE') DEFAULT NULL,
                                     PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;


-- crowndine.roles definition

CREATE TABLE `roles` (
                         `created_at` datetime(6) DEFAULT NULL,
                         `id` bigint NOT NULL AUTO_INCREMENT,
                         `updated_at` datetime(6) DEFAULT NULL,
                         `description` varchar(500) DEFAULT NULL,
                         `name` enum('ADMIN','STAFF','USER') NOT NULL,
                         PRIMARY KEY (`id`),
                         CONSTRAINT `uk_roles_name` UNIQUE (`name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;


-- crowndine.shifts definition

CREATE TABLE `shifts` (
                          `end_time` time DEFAULT NULL,
                          `start_time` time DEFAULT NULL,
                          `created_at` datetime(6) DEFAULT NULL,
                          `id` bigint NOT NULL AUTO_INCREMENT,
                          `updated_at` datetime(6) DEFAULT NULL,
                          `name` varchar(255) DEFAULT NULL,
                          PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;


-- crowndine.users definition

CREATE TABLE `users` (
                         `date_of_birth` date NOT NULL,
                         `created_at` datetime(6) DEFAULT NULL,
                         `id` bigint NOT NULL AUTO_INCREMENT,
                         `updated_at` datetime(6) DEFAULT NULL,
                         `phone` varchar(11) NOT NULL,
                         `avatar_url` varchar(200) DEFAULT NULL,
                         `email` varchar(255) NOT NULL,
                         `first_name` varchar(50) NOT NULL,
                         `last_name` varchar(50) NOT NULL,
                         `username` varchar(50) NOT NULL,
                         `password` varchar(255) NOT NULL,
                         `gender` enum('FEMALE','MALE','OTHER') NOT NULL,
                         `status` enum('ACTIVE','INACTIVE') NOT NULL,
                         `verification_code` varchar(255) DEFAULT NULL,
                         `verification_expiration` datetime(6) DEFAULT NULL,
                         PRIMARY KEY (`id`),
                         CONSTRAINT `uk_users_phone` UNIQUE (`phone`),
                         CONSTRAINT `uk_users_username` UNIQUE (`username`),
                         KEY `idx_users_avatar_url` (`avatar_url`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;


-- crowndine.vouchers definition

CREATE TABLE `vouchers` (
                            `discount_value` decimal(38,2) DEFAULT NULL,
                            `max_discount_value` decimal(38,2) DEFAULT NULL,
                            `created_at` datetime(6) DEFAULT NULL,
                            `id` bigint NOT NULL AUTO_INCREMENT,
                            `updated_at` datetime(6) DEFAULT NULL,
                            `name` varchar(100) DEFAULT NULL,
                            `code` varchar(255) DEFAULT NULL,
                            `description` varchar(255) DEFAULT NULL,
                            `type` enum('FIXED_AMOUNT','PERCENTAGE') DEFAULT NULL,
                            PRIMARY KEY (`id`),
                            CONSTRAINT `uk_vouchers_code` UNIQUE (`code`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;


-- crowndine.items definition

CREATE TABLE `items` (
                         `price` decimal(38,2) DEFAULT NULL,
                         `price_after_discount` decimal(38,2) DEFAULT NULL,
                         `category_id` bigint DEFAULT NULL,
                         `created_at` datetime(6) DEFAULT NULL,
                         `id` bigint NOT NULL AUTO_INCREMENT,
                         `updated_at` datetime(6) DEFAULT NULL,
                         `description` varchar(255) DEFAULT NULL,
                         `image_url` varchar(255) DEFAULT NULL,
                         `name` varchar(255) DEFAULT NULL,
                         `status` enum('AVAILABLE','UNAVAILABLE') DEFAULT NULL,
                         PRIMARY KEY (`id`),
                         KEY `idx_items_category_id` (`category_id`),
                         CONSTRAINT `fk_items_category_id_categories` FOREIGN KEY (`category_id`) REFERENCES `categories` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;


-- crowndine.reservations definition

CREATE TABLE `reservations` (
                                `date` date DEFAULT NULL,
                                `end_time` time DEFAULT NULL,
                                `guest_number` int DEFAULT NULL,
                                `start_time` time DEFAULT NULL,
                                `created_at` datetime(6) DEFAULT NULL,
                                `customer_id` bigint DEFAULT NULL,
                                `id` bigint NOT NULL AUTO_INCREMENT,
                                `restaurant_table_id` bigint DEFAULT NULL,
                                `updated_at` datetime(6) DEFAULT NULL,
                                `note` varchar(255) DEFAULT NULL,
                                `status` enum('CANCELLED','CHECKED_IN','COMPLETED','CONFIRMED','NO_SHOW','PENDING') DEFAULT NULL,
                                PRIMARY KEY (`id`),
                                KEY `idx_reservations_customer_id` (`customer_id`),
                                KEY `idx_reservations_restaurant_table_id` (`restaurant_table_id`),
                                CONSTRAINT `fk_reservations_customer_id_users` FOREIGN KEY (`customer_id`) REFERENCES `users` (`id`),
                                CONSTRAINT `fk_reservations_restaurant_table_id_restaurant_tables` FOREIGN KEY (`restaurant_table_id`) REFERENCES `restaurant_tables` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;


-- crowndine.tokens definition

CREATE TABLE `tokens` (
                          `created_at` datetime(6) DEFAULT NULL,
                          `expired_at` datetime(6) DEFAULT NULL,
                          `id` bigint NOT NULL AUTO_INCREMENT,
                          `updated_at` datetime(6) DEFAULT NULL,
                          `username` varchar(255) NOT NULL,
                          `device` VARCHAR(100),
                          `ip_address` VARCHAR(45),
                          `refresh_token` varchar(1000) DEFAULT NULL,
                          PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;


-- crowndine.user_roles definition

CREATE TABLE `user_roles` (
                              `role_id` bigint NOT NULL,
                              `user_id` bigint NOT NULL,
                              CONSTRAINT `pk_user_roles` PRIMARY KEY (`role_id`,`user_id`),
                              KEY `idx_user_roles_user_id` (`user_id`),
                              CONSTRAINT `fk_user_roles_role_id_roles` FOREIGN KEY (`role_id`) REFERENCES `roles` (`id`),
                              CONSTRAINT `fk_user_roles_user_id_users` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;


-- crowndine.user_vouchers definition

CREATE TABLE `user_vouchers` (
                                 `created_at` datetime(6) DEFAULT NULL,
                                 `customer_id` bigint DEFAULT NULL,
                                 `id` bigint NOT NULL AUTO_INCREMENT,
                                 `updated_at` datetime(6) DEFAULT NULL,
                                 `voucher_id` bigint DEFAULT NULL,
                                 `usage_count` int NOT NULL DEFAULT 0,
                                 `usage_limit` int NOT NULL DEFAULT 1,
                                 `assigned_at` datetime(6) DEFAULT CURRENT_TIMESTAMP(6),
                                 `expired_at` datetime(6) DEFAULT NULL,
                                 PRIMARY KEY (`id`),
                                 KEY `idx_user_vouchers_customer_id` (`customer_id`),
                                 KEY `idx_user_vouchers_voucher_id` (`voucher_id`),
                                 CONSTRAINT `fk_user_vouchers_voucher_id_vouchers` FOREIGN KEY (`voucher_id`) REFERENCES `vouchers` (`id`),
                                 CONSTRAINT `fk_user_vouchers_customer_id_users` FOREIGN KEY (`customer_id`) REFERENCES `users` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;


-- crowndine.work_schedules definition

CREATE TABLE `work_schedules` (
                                  `created_at` datetime(6) DEFAULT NULL,
                                  `id` bigint NOT NULL AUTO_INCREMENT,
                                  `shift_id` bigint DEFAULT NULL,
                                  `staff_id` bigint DEFAULT NULL,
                                  `note` varchar(200) DEFAULT NULL,
                                  `work_date` date NOT NULL,
                                  `updated_at` datetime(6) DEFAULT NULL,
                                  `status` enum('APPROVED','CANCELLED','PENDING','REJECTED') DEFAULT NULL,
                                  PRIMARY KEY (`id`),
                                  CONSTRAINT `uk_work_schedules_staff_shift_date` UNIQUE (`staff_id`,`shift_id`,`work_date`),
                                  KEY `idx_work_schedules_shift_id` (`shift_id`),
                                  KEY `idx_work_schedules_staff_id` (`staff_id`),
                                  CONSTRAINT `fk_work_schedules_staff_id_users` FOREIGN KEY (`staff_id`) REFERENCES `users` (`id`),
                                  CONSTRAINT `fk_work_schedules_shift_id_shifts` FOREIGN KEY (`shift_id`) REFERENCES `shifts` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;


-- crowndine.attendances definition

CREATE TABLE `attendances` (
                               `check_in_at` datetime(6) DEFAULT NULL,
                               `check_out_at` datetime(6) DEFAULT NULL,
                               `created_at` datetime(6) DEFAULT NULL,
                               `id` bigint NOT NULL AUTO_INCREMENT,
                               `updated_at` datetime(6) DEFAULT NULL,
                               `work_schedule_id` bigint DEFAULT NULL,
                               `note` varchar(500) DEFAULT NULL,
                               PRIMARY KEY (`id`),
                               CONSTRAINT `uk_attendances_work_schedule_id` UNIQUE (`work_schedule_id`),
                               CONSTRAINT `fk_attendances_work_schedule_id_work_schedules` FOREIGN KEY (`work_schedule_id`) REFERENCES `work_schedules` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;


-- crowndine.combo_items definition

CREATE TABLE `combo_items` (
                               `quantity` int DEFAULT NULL,
                               `combo_id` bigint DEFAULT NULL,
                               `created_at` datetime(6) DEFAULT NULL,
                               `id` bigint NOT NULL AUTO_INCREMENT,
                               `item_id` bigint DEFAULT NULL,
                               `updated_at` datetime(6) DEFAULT NULL,
                               PRIMARY KEY (`id`),
                               KEY `idx_combo_items_combo_id` (`combo_id`),
                               KEY `idx_combo_items_item_id` (`item_id`),
                               CONSTRAINT `fk_combo_items_combo_id_combos` FOREIGN KEY (`combo_id`) REFERENCES `combos` (`id`),
                               CONSTRAINT `fk_combo_items_item_id_items` FOREIGN KEY (`item_id`) REFERENCES `items` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;


-- crowndine.feedbacks definition

CREATE TABLE `feedbacks` (
                             `rating` int DEFAULT NULL,
                             `created_at` datetime(6) DEFAULT NULL,
                             `id` bigint NOT NULL AUTO_INCREMENT,
                             `item_id` bigint DEFAULT NULL,
                             `updated_at` datetime(6) DEFAULT NULL,
                             `user_id` bigint DEFAULT NULL,
                             `comment` varchar(200) DEFAULT NULL,
                             PRIMARY KEY (`id`),
                             KEY `idx_feedbacks_item_id` (`item_id`),
                             KEY `idx_feedbacks_user_id` (`user_id`),
                             CONSTRAINT `fk_feedbacks_item_id_items` FOREIGN KEY (`item_id`) REFERENCES `items` (`id`),
                             CONSTRAINT `fk_feedbacks_user_id_users` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;


-- crowndine.orders definition

CREATE TABLE `orders` (
                          `discount_price` decimal(38,2) DEFAULT NULL,
                          `final_price` decimal(38,2) DEFAULT NULL,
                          `total_price` decimal(38,2) DEFAULT NULL,
                          `created_at` datetime(6) DEFAULT NULL,
                          `id` bigint NOT NULL AUTO_INCREMENT,
                          `reservation_id` bigint DEFAULT NULL,
                          `restaurant_table_id` bigint DEFAULT NULL,
                          `updated_at` datetime(6) DEFAULT NULL,
                          `user_id` bigint DEFAULT NULL,
                          `staff_id` bigint DEFAULT NULL,
                          `voucher_id` bigint DEFAULT NULL,
                          `status` enum('PRE_ORDER','CONFIRMED','IN_PROGRESS','COMPLETED','CANCELLED') DEFAULT NULL,
                          PRIMARY KEY (`id`),
                          CONSTRAINT `uk_orders_reservation_id` UNIQUE (`reservation_id`),
                          KEY `idx_orders_restaurant_table_id` (`restaurant_table_id`),
                          KEY `idx_orders_user_id` (`user_id`),
                          KEY `idx_orders_voucher_id` (`voucher_id`),
                          CONSTRAINT `fk_orders_reservation_id_reservations` FOREIGN KEY (`reservation_id`) REFERENCES `reservations` (`id`),
                          CONSTRAINT `fk_orders_restaurant_table_id_restaurant_tables` FOREIGN KEY (`restaurant_table_id`) REFERENCES `restaurant_tables` (`id`),
                          CONSTRAINT `fk_orders_user_id_users` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`),
                          CONSTRAINT `fk_orders_staff_id_users` FOREIGN KEY (`staff_id`) REFERENCES `users` (`id`),
                          CONSTRAINT `fk_orders_voucher_id_vouchers` FOREIGN KEY (`voucher_id`) REFERENCES `vouchers` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;


-- crowndine.payments definition

CREATE TABLE `payments` (
                            `amount` decimal(38,2) DEFAULT NULL,
                            `created_at` datetime(6) DEFAULT NULL,
                            `id` bigint NOT NULL AUTO_INCREMENT,
                            `order_id` bigint DEFAULT NULL,
                            `reservation_id` bigint DEFAULT NULL,
                            `user_id` bigint NOT NULL,
                            `updated_at` datetime(6) DEFAULT NULL,
                            `transaction_code` varchar(255) DEFAULT NULL,
                            `method` enum('PAYOS','MOMO','CASH','ZALOPAY') DEFAULT NULL,
                            `status` enum('PENDING','FAILED','SUCCESS') DEFAULT NULL,
                            `type` enum('DEPOSIT','REFUND','SETTLEMENT') DEFAULT NULL,
                            `target` enum('RESERVATION','ORDER') DEFAULT NULL,
                            `source` enum('CLIENT_APP','POS_COUNTER') DEFAULT NULL,
                            `raw_api_data` text,
                            PRIMARY KEY (`id`),
                            KEY `idx_payments_order_id` (`order_id`),
                            KEY `idx_payments_reservation_id` (`reservation_id`),
                            KEY `idx_payments_user_id` (`user_id`),
                            CONSTRAINT `fk_payments_order_id_orders` FOREIGN KEY (`order_id`) REFERENCES `orders` (`id`),
                            CONSTRAINT `fk_payments_reservation_id_reservations` FOREIGN KEY (`reservation_id`) REFERENCES `reservations` (`id`),
                            CONSTRAINT `fk_payments_user_id_users` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;


-- crowndine.order_details definition

CREATE TABLE `order_details` (
                                 `quantity` int DEFAULT NULL,
                                 `total_price` decimal(38,2) DEFAULT NULL,
                                 `combo_id` bigint DEFAULT NULL,
                                 `created_at` datetime(6) DEFAULT NULL,
                                 `id` bigint NOT NULL AUTO_INCREMENT,
                                 `item_id` bigint DEFAULT NULL,
                                 `order_id` bigint DEFAULT NULL,
                                 `updated_at` datetime(6) DEFAULT NULL,
                                 `note` varchar(255) DEFAULT NULL,
                                 `status` enum('PENDING','COOKING','SERVED','CANCELLED') DEFAULT NULL,
                                 PRIMARY KEY (`id`),
                                 KEY `idx_order_details_combo_id` (`combo_id`),
                                 KEY `idx_order_details_item_id` (`item_id`),
                                 KEY `idx_order_details_order_id` (`order_id`),
                                 CONSTRAINT `fk_order_details_combo_id_combos` FOREIGN KEY (`combo_id`) REFERENCES `combos` (`id`),
                                 CONSTRAINT `fk_order_details_item_id_items` FOREIGN KEY (`item_id`) REFERENCES `items` (`id`),
                                 CONSTRAINT `fk_order_details_order_id_orders` FOREIGN KEY (`order_id`) REFERENCES `orders` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;



-- crowndine.reviews definition

CREATE TABLE `reviews` (
                           `created_at` datetime(6) DEFAULT NULL,
                           `id` bigint NOT NULL AUTO_INCREMENT,
                           `updated_at` datetime(6) DEFAULT NULL,
                           `comment` varchar(255) DEFAULT NULL,
                           `customer_id` bigint DEFAULT NULL,
                           PRIMARY KEY (`id`),
                           KEY `idx_reviews_customer_id` (`customer_id`),
                           CONSTRAINT `fk_reviews_customer_id_users` FOREIGN KEY (`customer_id`) REFERENCES `users` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;
