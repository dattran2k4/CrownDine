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
                          `status` enum('TEST') DEFAULT NULL,
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


-- crowndine.reviews definition

CREATE TABLE `reviews` (
                           `created_at` datetime(6) DEFAULT NULL,
                           `id` bigint NOT NULL AUTO_INCREMENT,
                           `updated_at` datetime(6) DEFAULT NULL,
                           `comment` varchar(255) DEFAULT NULL,
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
                         UNIQUE KEY `UKofx66keruapi6vyqpv6f2or37` (`name`)
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
                         `avatar_url` varchar(50) NOT NULL,
                         `email` varchar(50) NOT NULL,
                         `first_name` varchar(50) NOT NULL,
                         `last_name` varchar(50) NOT NULL,
                         `username` varchar(50) NOT NULL,
                         `password` varchar(255) NOT NULL,
                         `gender` enum('FEMALE','MALE','OTHER') NOT NULL,
                         `status` enum('ACTIVE','INACTIVE') NOT NULL,
                         PRIMARY KEY (`id`),
                         UNIQUE KEY `UKdu5v5sr43g5bfnji4vb8hg5s3` (`phone`),
                         UNIQUE KEY `UKma1e5g5a354bb93w98c8366ik` (`avatar_url`),
                         UNIQUE KEY `UKr43af9ap4edm43mmtq01oddj6` (`username`)
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
                            UNIQUE KEY `UKmii5rtxmg6nqqsdpgsyir21kx` (`name`)
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
                         KEY `FKjcdcde7htb3tyjgouo4g9xbmr` (`category_id`),
                         CONSTRAINT `FKjcdcde7htb3tyjgouo4g9xbmr` FOREIGN KEY (`category_id`) REFERENCES `categories` (`id`)
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
                                KEY `FKcmkyuub3ieebwbnrvh5710ply` (`customer_id`),
                                KEY `FKefnkka0kk0ilojfptgn02u08n` (`restaurant_table_id`),
                                CONSTRAINT `FKcmkyuub3ieebwbnrvh5710ply` FOREIGN KEY (`customer_id`) REFERENCES `users` (`id`),
                                CONSTRAINT `FKefnkka0kk0ilojfptgn02u08n` FOREIGN KEY (`restaurant_table_id`) REFERENCES `restaurant_tables` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;


-- crowndine.tokens definition

CREATE TABLE `tokens` (
                          `is_expired` bit(1) DEFAULT NULL,
                          `is_revoked` bit(1) DEFAULT NULL,
                          `created_at` datetime(6) DEFAULT NULL,
                          `id` bigint NOT NULL AUTO_INCREMENT,
                          `updated_at` datetime(6) DEFAULT NULL,
                          `user_id` bigint DEFAULT NULL,
                          `token` varchar(255) NOT NULL,
                          `token_type` enum('ACCESS_TOKEN','REFRESH_TOKEN') DEFAULT NULL,
                          PRIMARY KEY (`id`),
                          UNIQUE KEY `UKna3v9f8s7ucnj16tylrs822qj` (`token`),
                          KEY `FK2dylsfo39lgjyqml2tbe0b0ss` (`user_id`),
                          CONSTRAINT `FK2dylsfo39lgjyqml2tbe0b0ss` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;


-- crowndine.user_roles definition

CREATE TABLE `user_roles` (
                              `role_id` bigint NOT NULL,
                              `user_id` bigint NOT NULL,
                              PRIMARY KEY (`role_id`,`user_id`),
                              KEY `FKhfh9dx7w3ubf1co1vdev94g3f` (`user_id`),
                              CONSTRAINT `FKh8ciramu9cc9q3qcqiv4ue8a6` FOREIGN KEY (`role_id`) REFERENCES `roles` (`id`),
                              CONSTRAINT `FKhfh9dx7w3ubf1co1vdev94g3f` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;


-- crowndine.user_vouchers definition

CREATE TABLE `user_vouchers` (
                                 `created_at` datetime(6) DEFAULT NULL,
                                 `customer_id` bigint DEFAULT NULL,
                                 `id` bigint NOT NULL AUTO_INCREMENT,
                                 `updated_at` datetime(6) DEFAULT NULL,
                                 `voucher_id` bigint DEFAULT NULL,
                                 PRIMARY KEY (`id`),
                                 KEY `FKigrfm979v1p7rxvg9k9dcxiew` (`customer_id`),
                                 KEY `FK40ig7khk2v79rbqaj98mf1g2q` (`voucher_id`),
                                 CONSTRAINT `FK40ig7khk2v79rbqaj98mf1g2q` FOREIGN KEY (`voucher_id`) REFERENCES `vouchers` (`id`),
                                 CONSTRAINT `FKigrfm979v1p7rxvg9k9dcxiew` FOREIGN KEY (`customer_id`) REFERENCES `users` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;


-- crowndine.work_schedules definition

CREATE TABLE `work_schedules` (
                                  `created_at` datetime(6) DEFAULT NULL,
                                  `id` bigint NOT NULL AUTO_INCREMENT,
                                  `shift_id` bigint DEFAULT NULL,
                                  `staff_id` bigint DEFAULT NULL,
                                  `updated_at` datetime(6) DEFAULT NULL,
                                  `status` enum('APPROVED','CANCELLED','PENDING','REJECTED') DEFAULT NULL,
                                  PRIMARY KEY (`id`),
                                  KEY `FKoe9yynmgiahyihuhas36bnfwb` (`shift_id`),
                                  KEY `FK1rccjjhay8dypgbcfuggfrjxd` (`staff_id`),
                                  CONSTRAINT `FK1rccjjhay8dypgbcfuggfrjxd` FOREIGN KEY (`staff_id`) REFERENCES `users` (`id`),
                                  CONSTRAINT `FKoe9yynmgiahyihuhas36bnfwb` FOREIGN KEY (`shift_id`) REFERENCES `shifts` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;


-- crowndine.attendances definition

CREATE TABLE `attendances` (
                               `check_in_time` time DEFAULT NULL,
                               `check_out_time` time DEFAULT NULL,
                               `created_at` datetime(6) DEFAULT NULL,
                               `id` bigint NOT NULL AUTO_INCREMENT,
                               `updated_at` datetime(6) DEFAULT NULL,
                               `user_id` bigint DEFAULT NULL,
                               `work_schedule_id` bigint DEFAULT NULL,
                               `note` varchar(500) DEFAULT NULL,
                               PRIMARY KEY (`id`),
                               UNIQUE KEY `UKpwpvw6yhdmixs5w6q3je4tcyf` (`work_schedule_id`),
                               KEY `FK8o39cn3ghqwhccyrrqdesttr8` (`user_id`),
                               CONSTRAINT `FK3jvbpdispud5josnga5j10llo` FOREIGN KEY (`work_schedule_id`) REFERENCES `work_schedules` (`id`),
                               CONSTRAINT `FK8o39cn3ghqwhccyrrqdesttr8` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`)
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
                               KEY `FK48h944x1aynyjkgfxa1tu5n32` (`combo_id`),
                               KEY `FK65pec964nqgk6rgpsgm5u118x` (`item_id`),
                               CONSTRAINT `FK48h944x1aynyjkgfxa1tu5n32` FOREIGN KEY (`combo_id`) REFERENCES `combos` (`id`),
                               CONSTRAINT `FK65pec964nqgk6rgpsgm5u118x` FOREIGN KEY (`item_id`) REFERENCES `items` (`id`)
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
                             KEY `FKa94qj7kb165hywij5gpgt5lcr` (`item_id`),
                             KEY `FK312drfl5lquu37mu4trk8jkwx` (`user_id`),
                             CONSTRAINT `FK312drfl5lquu37mu4trk8jkwx` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`),
                             CONSTRAINT `FKa94qj7kb165hywij5gpgt5lcr` FOREIGN KEY (`item_id`) REFERENCES `items` (`id`)
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
                          `voucher_id` bigint DEFAULT NULL,
                          `status` enum('CANCELLED','COMPLETED','PENDING','PRE_ORDER','SERVED') DEFAULT NULL,
                          PRIMARY KEY (`id`),
                          UNIQUE KEY `UK72hx6qp7pqavtjrwde9gbm13x` (`reservation_id`),
                          KEY `FKgowqti7ase2e3o3k76kuani2w` (`restaurant_table_id`),
                          KEY `FK32ql8ubntj5uh44ph9659tiih` (`user_id`),
                          KEY `FKdimvsocblb17f45ikjr6xn1wj` (`voucher_id`),
                          CONSTRAINT `FK32ql8ubntj5uh44ph9659tiih` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`),
                          CONSTRAINT `FKbn1idyqvshli7bj1rxurlsnju` FOREIGN KEY (`reservation_id`) REFERENCES `reservations` (`id`),
                          CONSTRAINT `FKdimvsocblb17f45ikjr6xn1wj` FOREIGN KEY (`voucher_id`) REFERENCES `vouchers` (`id`),
                          CONSTRAINT `FKgowqti7ase2e3o3k76kuani2w` FOREIGN KEY (`restaurant_table_id`) REFERENCES `restaurant_tables` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;


-- crowndine.payments definition

CREATE TABLE `payments` (
                            `amount` decimal(38,2) DEFAULT NULL,
                            `created_at` datetime(6) DEFAULT NULL,
                            `id` bigint NOT NULL AUTO_INCREMENT,
                            `order_id` bigint DEFAULT NULL,
                            `reservation_id` bigint DEFAULT NULL,
                            `updated_at` datetime(6) DEFAULT NULL,
                            `transaction_code` varchar(255) DEFAULT NULL,
                            `method` enum('BANK_TRANSFER','CASH','CREDIT_CARD') DEFAULT NULL,
                            `status` enum('FAILED','SUCCESS') DEFAULT NULL,
                            `type` enum('DEPOSIT','REFUND','SETTLEMENT') DEFAULT NULL,
                            PRIMARY KEY (`id`),
                            KEY `FK81gagumt0r8y3rmudcgpbk42l` (`order_id`),
                            KEY `FKp8yh4sjt3u0g6aru1oxfh3o14` (`reservation_id`),
                            CONSTRAINT `FK81gagumt0r8y3rmudcgpbk42l` FOREIGN KEY (`order_id`) REFERENCES `orders` (`id`),
                            CONSTRAINT `FKp8yh4sjt3u0g6aru1oxfh3o14` FOREIGN KEY (`reservation_id`) REFERENCES `reservations` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;


-- crowndine.order_details definition

CREATE TABLE `order_details` (
                                 `quantity` int DEFAULT NULL,
                                 `total_price` int DEFAULT NULL,
                                 `combo_id` bigint DEFAULT NULL,
                                 `created_at` datetime(6) DEFAULT NULL,
                                 `id` bigint NOT NULL AUTO_INCREMENT,
                                 `item_id` bigint DEFAULT NULL,
                                 `order_id` bigint DEFAULT NULL,
                                 `updated_at` datetime(6) DEFAULT NULL,
                                 `note` varchar(255) DEFAULT NULL,
                                 PRIMARY KEY (`id`),
                                 KEY `FKgdw8tvw472t9vkp1bk2ksaj47` (`combo_id`),
                                 KEY `FKnfrrgu0scdkwpptvs5gx6m6o9` (`item_id`),
                                 KEY `FKjyu2qbqt8gnvno9oe9j2s2ldk` (`order_id`),
                                 CONSTRAINT `FKgdw8tvw472t9vkp1bk2ksaj47` FOREIGN KEY (`combo_id`) REFERENCES `combos` (`id`),
                                 CONSTRAINT `FKjyu2qbqt8gnvno9oe9j2s2ldk` FOREIGN KEY (`order_id`) REFERENCES `orders` (`id`),
                                 CONSTRAINT `FKnfrrgu0scdkwpptvs5gx6m6o9` FOREIGN KEY (`item_id`) REFERENCES `items` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;