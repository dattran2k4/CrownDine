ALTER TABLE `reservations`
    ADD COLUMN `code` VARCHAR(255);

ALTER TABLE `payments`
    ADD COLUMN `code` BIGINT;

ALTER TABLE `orders`
    ADD COLUMN `code` VARCHAR(255);
