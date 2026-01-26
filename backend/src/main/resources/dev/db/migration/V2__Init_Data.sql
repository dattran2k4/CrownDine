INSERT INTO roles (id, name)
VALUES (1, 'ADMIN'),
       (2, 'USER'),
       (3, 'STAFF');

INSERT INTO users (username, password, email, first_name, last_name, date_of_birth, gender, status, phone, created_at,
                   updated_at)
VALUES ('johndoe', '$2a$10$s3go5e.GYivSMmrJXG6jceddjfSAbg6O832Sip8XIVNRRLIjXNP6G', 'johndoe@gmail.com', 'Dat', 'Tran',
        '2002-05-10', 'MALE', 'ACTIVE', '0912345678', NOW(), NOW());


INSERT INTO user_roles (user_id, role_id)
VALUES (1, 1),
       (1, 2);