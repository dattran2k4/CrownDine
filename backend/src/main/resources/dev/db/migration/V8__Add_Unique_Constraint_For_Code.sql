ALTER TABLE `reservations`
    MODIFY COLUMN `code` VARCHAR(255) NOT NULL,
    ADD CONSTRAINT uk_reservations_code UNIQUE (`code`);

ALTER TABLE `payments`
    MODIFY COLUMN `code` BIGINT NOT NULL,
    ADD CONSTRAINT uk_payments_code UNIQUE (`code`);

ALTER TABLE `orders`
    MODIFY COLUMN `code` VARCHAR(255) NOT NULL,
    ADD CONSTRAINT uk_orders_code UNIQUE (`code`);