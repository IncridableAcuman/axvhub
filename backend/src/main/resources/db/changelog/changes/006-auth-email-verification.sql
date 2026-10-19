--liquibase formatted sql
--changeset izzatbek:006-auth-email-verification

ALTER TABLE users ADD COLUMN IF NOT EXISTS email_verified BOOLEAN NOT NULL DEFAULT FALSE;

UPDATE users SET email_verified = TRUE WHERE email_verified IS FALSE;

CREATE TABLE IF NOT EXISTS email_verification_tokens (
    id BIGSERIAL PRIMARY KEY,
    token VARCHAR(255) NOT NULL UNIQUE,
    code VARCHAR(20) NOT NULL,
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    expiry_date TIMESTAMP WITHOUT TIME ZONE NOT NULL,
    used BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_email_verif_token ON email_verification_tokens (token);
CREATE INDEX IF NOT EXISTS idx_email_verif_user ON email_verification_tokens (user_id);
CREATE INDEX IF NOT EXISTS idx_email_verif_code ON email_verification_tokens (user_id, code);
