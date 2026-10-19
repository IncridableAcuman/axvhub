--liquibase formatted sql
--changeset izzatbek:009-modules-12-and-13-schema

-- ============================================================================
-- MODUL 12: Analitika va PDF hisobotlar (Analytics & Reporting)
-- Optimallashtirish indekslari va hisobotlar auditi
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_attendance_records_status ON attendance_records(status);
CREATE INDEX IF NOT EXISTS idx_lesson_sessions_group_status ON lesson_sessions(group_id, status);
CREATE INDEX IF NOT EXISTS idx_lesson_sessions_mentor_status ON lesson_sessions(mentor_id, status);
CREATE INDEX IF NOT EXISTS idx_student_lesson_progress_student ON student_lesson_progress(student_id);
CREATE INDEX IF NOT EXISTS idx_student_lesson_progress_status ON student_lesson_progress(status);
CREATE INDEX IF NOT EXISTS idx_assignment_submissions_student ON assignment_submissions(student_id);
CREATE INDEX IF NOT EXISTS idx_assignment_submissions_status ON assignment_submissions(status);
CREATE INDEX IF NOT EXISTS idx_student_assessment_attempts_status ON student_assessment_attempts(status);

-- ============================================================================
-- MODUL 13: AI Assistant (Teaching & Learning Assistant)
-- Interaksiya jurnali va audit metadata
-- ============================================================================

CREATE TABLE IF NOT EXISTS ai_interaction_logs (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT REFERENCES users(id) ON DELETE SET NULL,
    provider VARCHAR(50) NOT NULL,
    model VARCHAR(100),
    user_role VARCHAR(50),
    intent VARCHAR(100) NOT NULL,
    target_grade_level VARCHAR(50),
    target_subject VARCHAR(100),
    prompt_length INT,
    response_length INT,
    duration_ms BIGINT,
    status VARCHAR(50) NOT NULL DEFAULT 'SUCCESS',
    error_message TEXT,
    created_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_ai_logs_user ON ai_interaction_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_ai_logs_intent ON ai_interaction_logs(intent);
CREATE INDEX IF NOT EXISTS idx_ai_logs_created_at ON ai_interaction_logs(created_at);
