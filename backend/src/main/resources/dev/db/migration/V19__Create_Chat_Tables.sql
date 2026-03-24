-- Create chat_conversations table with utf8mb4 charset to support emoji and 4-byte UTF-8 characters
CREATE TABLE `chat_conversations` (
                                      `id` bigint NOT NULL AUTO_INCREMENT,
                                      `created_at` datetime(6) DEFAULT NULL,
                                      `updated_at` datetime(6) DEFAULT NULL,
                                      `title` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
                                      `user_id` bigint NOT NULL,
                                      PRIMARY KEY (`id`),
                                      KEY `idx_chat_conversations_user_id` (`user_id`),
                                      CONSTRAINT `fk_chat_conversations_user_id` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Create chat_messages table with utf8mb4 charset to support emoji and 4-byte UTF-8 characters
CREATE TABLE `chat_messages` (
                                 `id` bigint NOT NULL AUTO_INCREMENT,
                                 `created_at` datetime(6) DEFAULT NULL,
                                 `updated_at` datetime(6) DEFAULT NULL,
                                 `role` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
                                 `content` TEXT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
                                 `model` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
                                 `conversation_id` bigint NOT NULL,
                                 PRIMARY KEY (`id`),
                                 KEY `idx_chat_messages_conversation_id` (`conversation_id`),
                                 CONSTRAINT `fk_chat_messages_conversation_id` FOREIGN KEY (`conversation_id`) REFERENCES `chat_conversations` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Ensure all columns are properly set to utf8mb4 (in case tables were created with different charset)
ALTER TABLE `chat_conversations` CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
ALTER TABLE `chat_messages` CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Specifically ensure the content and title columns support emoji
ALTER TABLE `chat_messages` MODIFY `content` TEXT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL;
ALTER TABLE `chat_conversations` MODIFY `title` VARCHAR(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL;