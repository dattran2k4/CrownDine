UPDATE `reservations`
SET `code` = CONCAT(
        'RES-',
        DATE_FORMAT(created_at, '%Y%m%d'),
        '-',
        LPAD(id, 6, '0')
             )
WHERE `code` IS NULL
   OR `code` = '';

UPDATE payments
SET `code` = (
    UNIX_TIMESTAMP(created_at) * 1000000 + id
    )
WHERE `code` IS NULL
   OR `code` = 0;

UPDATE `orders`
SET `code` = CONCAT(
        'RES-',
        DATE_FORMAT(created_at, '%Y%m%d'),
        '-',
        LPAD(id, 6, '0')
             )
WHERE `code` IS NULL
   OR `code` = '';