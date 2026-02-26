CREATE TABLE `floors` (
                          `id` BIGINT NOT NULL AUTO_INCREMENT,
                          `name` VARCHAR(255) NOT NULL,
                          `floor_number` INT DEFAULT NULL,
                          `description` VARCHAR(500) DEFAULT NULL,
                          `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                          `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                          PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;

CREATE TABLE `areas` (
                         `id` BIGINT NOT NULL AUTO_INCREMENT,
                         `name` VARCHAR(255) NOT NULL,
                         `description` VARCHAR(500) DEFAULT NULL,
                         `floor_id` BIGINT NOT NULL,
                         `x` DOUBLE DEFAULT NULL,
                         `y` DOUBLE DEFAULT NULL,
                         `width` DOUBLE DEFAULT NULL,
                         `height` DOUBLE DEFAULT NULL,
                         `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                         `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                         PRIMARY KEY (`id`),
                         CONSTRAINT `fk_area_floor`
                             FOREIGN KEY (`floor_id`)
                                 REFERENCES `floors`(`id`)
                                 ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;

ALTER TABLE `restaurant_tables`
  ADD COLUMN `base_deposit` DECIMAL(12,2) DEFAULT NULL,
  ADD COLUMN `position_x` INT DEFAULT NULL,
  ADD COLUMN `position_y` INT DEFAULT NULL,
  ADD COLUMN `width` INT DEFAULT NULL,
  ADD COLUMN `height` INT DEFAULT NULL,
  ADD COLUMN `rotation` INT DEFAULT NULL,
  ADD COLUMN `shape` VARCHAR(50) DEFAULT NULL,
  ADD COLUMN `area_id` BIGINT DEFAULT NULL,
  ADD CONSTRAINT `fk_restaurant_tables_area`
    FOREIGN KEY (`area_id`)
    REFERENCES `areas`(`id`)
    ON DELETE CASCADE;
