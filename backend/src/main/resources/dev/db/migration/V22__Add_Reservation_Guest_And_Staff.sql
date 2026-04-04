ALTER TABLE reservations
    ADD COLUMN guest_name VARCHAR(100) NULL,
    ADD COLUMN created_by_staff_id BIGINT NULL,
    ADD CONSTRAINT fk_reservations_created_by_staff_id_users
        FOREIGN KEY (created_by_staff_id) REFERENCES users (id);

CREATE INDEX idx_reservations_created_by_staff_id
    ON reservations (created_by_staff_id);
