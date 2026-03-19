ALTER TABLE reservations
    ADD COLUMN checked_out_at datetime(6) DEFAULT NULL AFTER end_time;
