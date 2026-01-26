-- crowndine.banners definition

CREATE TABLE `banners` (
                           `created_at` datetime(6) DEFAULT NULL,
                           `id` bigint NOT NULL AUTO_INCREMENT,
                           `updated_at` datetime(6) DEFAULT NULL,
                           `title` varchar(100) DEFAULT NULL,
                           `description` varchar(500) DEFAULT NULL,
                           `banner_url` varchar(255) DEFAULT NULL,
                           `link_url` varchar(255) DEFAULT NULL,
                           `status` enum('ACTIVE','INACTIVE') NOT NULL,
                           PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;