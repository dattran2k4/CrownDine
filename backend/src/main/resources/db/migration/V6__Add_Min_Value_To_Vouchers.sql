ALTER TABLE `vouchers`
    ADD COLUMN `min_value` decimal(38,2) DEFAULT NULL AFTER `max_discount_value`;

UPDATE `vouchers`
SET `min_value` = `discount_value` + 20000
WHERE `type` = 'FIXED_AMOUNT'
  AND `discount_value` IS NOT NULL
  AND `min_value` IS NULL;
