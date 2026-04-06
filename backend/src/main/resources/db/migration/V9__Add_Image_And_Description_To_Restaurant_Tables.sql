ALTER TABLE `restaurant_tables`
    ADD COLUMN IF NOT EXISTS `image_url` VARCHAR(255) NULL,
    ADD COLUMN IF NOT EXISTS `description` TEXT NULL;
