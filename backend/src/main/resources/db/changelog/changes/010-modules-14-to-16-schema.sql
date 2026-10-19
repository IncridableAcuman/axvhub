--liquibase formatted sql
--changeset izzatbek:010-modules-14-to-16-schema

-- ============================================================================
-- MODUL 14: Bildirishnomalar (Notification Center)
-- ============================================================================

CREATE TABLE IF NOT EXISTS notifications (
    id BIGSERIAL PRIMARY KEY,
    recipient_user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    type VARCHAR(50) NOT NULL,
    is_read BOOLEAN NOT NULL DEFAULT FALSE,
    read_at TIMESTAMP WITHOUT TIME ZONE,
    deduplication_key VARCHAR(120),
    action_url VARCHAR(255),
    metadata TEXT,
    created_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITHOUT TIME ZONE
);

CREATE INDEX IF NOT EXISTS idx_notifications_recipient ON notifications(recipient_user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_recipient_read ON notifications(recipient_user_id, is_read);
CREATE INDEX IF NOT EXISTS idx_notifications_dedup ON notifications(deduplication_key);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications(created_at);

CREATE TABLE IF NOT EXISTS notification_preferences (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
    in_app_enabled BOOLEAN NOT NULL DEFAULT TRUE,
    email_enabled BOOLEAN NOT NULL DEFAULT TRUE,
    lesson_alerts BOOLEAN NOT NULL DEFAULT TRUE,
    assignment_alerts BOOLEAN NOT NULL DEFAULT TRUE,
    assessment_alerts BOOLEAN NOT NULL DEFAULT TRUE,
    announcement_alerts BOOLEAN NOT NULL DEFAULT TRUE,
    digest_frequency VARCHAR(20) NOT NULL DEFAULT 'INSTANT',
    created_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITHOUT TIME ZONE
);

CREATE TABLE IF NOT EXISTS notification_outbox (
    id BIGSERIAL PRIMARY KEY,
    notification_id BIGINT REFERENCES notifications(id) ON DELETE CASCADE,
    channel VARCHAR(20) NOT NULL DEFAULT 'EMAIL',
    recipient VARCHAR(255) NOT NULL,
    subject VARCHAR(255) NOT NULL,
    payload TEXT NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'PENDING',
    attempts INT NOT NULL DEFAULT 0,
    last_attempt_at TIMESTAMP WITHOUT TIME ZONE,
    error_message TEXT,
    created_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITHOUT TIME ZONE
);

CREATE INDEX IF NOT EXISTS idx_notification_outbox_status ON notification_outbox(status);
CREATE INDEX IF NOT EXISTS idx_notification_outbox_created_at ON notification_outbox(created_at);

-- ============================================================================
-- MODUL 15: Foydalanuvchi sozlamalari (User Preferences & Localization)
-- ============================================================================

CREATE TABLE IF NOT EXISTS user_preferences (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
    locale VARCHAR(10) NOT NULL DEFAULT 'uz',
    theme VARCHAR(20) NOT NULL DEFAULT 'system',
    reduced_motion BOOLEAN NOT NULL DEFAULT FALSE,
    date_format VARCHAR(20) NOT NULL DEFAULT 'YYYY-MM-DD',
    created_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITHOUT TIME ZONE
);

CREATE INDEX IF NOT EXISTS idx_user_preferences_user ON user_preferences(user_id);

-- ============================================================================
-- MODUL 16: Administrator paneli va tizim boshqaruvi (Audit & System Operations)
-- ============================================================================

-- Audit logs jadvalini yangi talablar bilan to'ldirish
ALTER TABLE audit_logs ADD COLUMN IF NOT EXISTS outcome VARCHAR(20) DEFAULT 'SUCCESS';
ALTER TABLE audit_logs ADD COLUMN IF NOT EXISTS ip_address VARCHAR(45);
ALTER TABLE audit_logs ADD COLUMN IF NOT EXISTS metadata TEXT;

CREATE INDEX IF NOT EXISTS idx_audit_logs_action ON audit_logs(action);
CREATE INDEX IF NOT EXISTS idx_audit_logs_performed_by ON audit_logs(performed_by);
CREATE INDEX IF NOT EXISTS idx_audit_logs_entity_name ON audit_logs(entity_name);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON audit_logs(created_at);

-- Tizim konfiguratsiyalari jadvali
CREATE TABLE IF NOT EXISTS system_configs (
    id BIGSERIAL PRIMARY KEY,
    config_key VARCHAR(100) NOT NULL UNIQUE,
    config_value TEXT NOT NULL,
    category VARCHAR(50) NOT NULL DEFAULT 'GENERAL',
    is_secret BOOLEAN NOT NULL DEFAULT FALSE,
    description VARCHAR(255),
    updated_by VARCHAR(100),
    created_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITHOUT TIME ZONE
);

CREATE INDEX IF NOT EXISTS idx_system_configs_key ON system_configs(config_key);
CREATE INDEX IF NOT EXISTS idx_system_configs_category ON system_configs(category);

-- Dastlabki xavfsiz tizim parametrlarini kiritish
INSERT INTO system_configs (config_key, config_value, category, is_secret, description, updated_by)
VALUES
    ('platform.maintenance_mode', 'false', 'GENERAL', false, 'Tizimda profilaktika rejimi yoqilganligi', 'SYSTEM'),
    ('platform.registration_open', 'true', 'GENERAL', false, 'Yangi foydalanuvchilar mustaqil ro''yxatdan o''tishi', 'SYSTEM'),
    ('features.ai_assistant', 'true', 'FEATURES', false, 'AI Teaching Assistant moduli faolligi', 'SYSTEM'),
    ('features.email_notifications', 'true', 'NOTIFICATIONS', false, 'Email orqali bildirishnomalar yuborish', 'SYSTEM'),
    ('enrollment.max_group_capacity', '24', 'GENERAL', false, 'O''quv guruhidagi maksimal o''quvchilar soni', 'SYSTEM'),
    ('security.session_timeout_minutes', '120', 'SECURITY', false, 'Foydalanuvchi sessiyasining amal qilish muddati (daqiqa)', 'SYSTEM')
ON CONFLICT (config_key) DO NOTHING;
