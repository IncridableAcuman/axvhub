--liquibase formatted sql
--changeset izzatbek:003-user-registration-support

ALTER TABLE users ALTER COLUMN username TYPE VARCHAR(255);
CREATE UNIQUE INDEX IF NOT EXISTS idx_users_email ON users (LOWER(email)) WHERE email IS NOT NULL;
