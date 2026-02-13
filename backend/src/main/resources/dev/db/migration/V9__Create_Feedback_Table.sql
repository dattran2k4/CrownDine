ALTER TABLE feedbacks
    ADD COLUMN combo_id BIGINT NULL,
    ADD COLUMN order_detail_id BIGINT NULL;

ALTER TABLE feedbacks
    ADD CONSTRAINT FK_feedbacks_combo
        FOREIGN KEY (combo_id) REFERENCES combos(id);

ALTER TABLE feedbacks
    ADD CONSTRAINT FK_feedbacks_order_detail
        FOREIGN KEY (order_detail_id) REFERENCES order_details(id);

CREATE INDEX idx_feedbacks_combo_id ON feedbacks(combo_id);
CREATE INDEX idx_feedbacks_order_detail_id ON feedbacks(order_detail_id);

ALTER TABLE feedbacks
    ADD CONSTRAINT uq_feedbacks_user_order_detail UNIQUE (user_id, order_detail_id);