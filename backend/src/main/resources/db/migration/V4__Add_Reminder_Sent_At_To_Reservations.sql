ALTER TABLE reservations
    ADD COLUMN reminder_sent_at datetime(6) DEFAULT NULL AFTER checked_out_at;
