--liquibase formatted sql
--changeset izzatbek:004-modules-04-to-07-schema

-- 1. Modul 04: RBAC & User Management
CREATE TABLE IF NOT EXISTS roles (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    description VARCHAR(255),
    is_system BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITHOUT TIME ZONE
);

CREATE TABLE IF NOT EXISTS permissions (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    category VARCHAR(100) NOT NULL,
    description VARCHAR(255),
    created_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITHOUT TIME ZONE
);

CREATE TABLE IF NOT EXISTS user_roles (
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    role_id BIGINT NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
    assigned_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT NOW(),
    assigned_by VARCHAR(100),
    PRIMARY KEY (user_id, role_id)
);

CREATE TABLE IF NOT EXISTS role_permissions (
    role_id BIGINT NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
    permission_id BIGINT NOT NULL REFERENCES permissions(id) ON DELETE CASCADE,
    PRIMARY KEY (role_id, permission_id)
);

-- 2. Modul 05: Ta'lim tuzilmasi & Guruhlar
CREATE TABLE IF NOT EXISTS academic_periods (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    code VARCHAR(50) NOT NULL UNIQUE,
    start_date DATE,
    end_date DATE,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITHOUT TIME ZONE
);

ALTER TABLE study_groups ADD COLUMN IF NOT EXISTS status VARCHAR(50) NOT NULL DEFAULT 'ACTIVE';
ALTER TABLE study_groups ADD COLUMN IF NOT EXISTS academic_period_id BIGINT REFERENCES academic_periods(id) ON DELETE SET NULL;
ALTER TABLE study_groups ADD COLUMN IF NOT EXISTS max_capacity INT NOT NULL DEFAULT 16;

CREATE TABLE IF NOT EXISTS group_memberships (
    id BIGSERIAL PRIMARY KEY,
    student_id BIGINT NOT NULL REFERENCES students(id) ON DELETE CASCADE,
    group_id BIGINT NOT NULL REFERENCES study_groups(id) ON DELETE CASCADE,
    status VARCHAR(50) NOT NULL DEFAULT 'ACTIVE',
    enrolled_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT NOW(),
    left_at TIMESTAMP WITHOUT TIME ZONE,
    transfer_reason TEXT,
    previous_group_id BIGINT REFERENCES study_groups(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITHOUT TIME ZONE
);

CREATE INDEX IF NOT EXISTS idx_group_memberships_student ON group_memberships(student_id);
CREATE INDEX IF NOT EXISTS idx_group_memberships_group ON group_memberships(group_id);

-- 3. Modul 06: Mentor profillari
CREATE TABLE IF NOT EXISTS mentor_profiles (
    id BIGSERIAL PRIMARY KEY,
    mentor_id BIGINT UNIQUE REFERENCES mentors(id) ON DELETE CASCADE,
    user_id BIGINT REFERENCES users(id) ON DELETE SET NULL,
    display_name VARCHAR(255) NOT NULL,
    headline VARCHAR(255),
    bio TEXT,
    years_of_experience INT DEFAULT 0,
    branch_location VARCHAR(255),
    phone VARCHAR(50),
    email VARCHAR(255),
    is_contact_public BOOLEAN NOT NULL DEFAULT FALSE,
    github_url VARCHAR(255),
    linkedin_url VARCHAR(255),
    portfolio_url VARCHAR(255),
    profile_photo_url VARCHAR(500),
    publication_status VARCHAR(50) NOT NULL DEFAULT 'DRAFT',
    rejection_reason TEXT,
    reviewed_by VARCHAR(100),
    reviewed_at TIMESTAMP WITHOUT TIME ZONE,
    created_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITHOUT TIME ZONE
);

CREATE TABLE IF NOT EXISTS mentor_skills (
    id BIGSERIAL PRIMARY KEY,
    profile_id BIGINT NOT NULL REFERENCES mentor_profiles(id) ON DELETE CASCADE,
    skill_name VARCHAR(100) NOT NULL,
    proficiency_level VARCHAR(50) NOT NULL DEFAULT 'INTERMEDIATE',
    category VARCHAR(100),
    created_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS mentor_experiences (
    id BIGSERIAL PRIMARY KEY,
    profile_id BIGINT NOT NULL REFERENCES mentor_profiles(id) ON DELETE CASCADE,
    company_name VARCHAR(255) NOT NULL,
    role_title VARCHAR(255) NOT NULL,
    description TEXT,
    start_date DATE,
    end_date DATE,
    is_current BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS mentor_educations (
    id BIGSERIAL PRIMARY KEY,
    profile_id BIGINT NOT NULL REFERENCES mentor_profiles(id) ON DELETE CASCADE,
    institution VARCHAR(255) NOT NULL,
    degree_or_certificate VARCHAR(255) NOT NULL,
    field_of_study VARCHAR(255),
    issue_year INT,
    verification_status VARCHAR(50) NOT NULL DEFAULT 'UNVERIFIED',
    created_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT NOW()
);

-- 4. Modul 07: Darslar jadvali & Davomat
CREATE TABLE IF NOT EXISTS lesson_sessions (
    id BIGSERIAL PRIMARY KEY,
    schedule_id BIGINT REFERENCES schedules(id) ON DELETE SET NULL,
    group_id BIGINT NOT NULL REFERENCES study_groups(id) ON DELETE CASCADE,
    mentor_id BIGINT NOT NULL REFERENCES mentors(id) ON DELETE CASCADE,
    room VARCHAR(100),
    subject VARCHAR(255) NOT NULL,
    topic VARCHAR(255),
    lesson_date DATE NOT NULL,
    start_time VARCHAR(20) NOT NULL,
    end_time VARCHAR(20) NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'SCHEDULED',
    cancellation_reason TEXT,
    notes TEXT,
    created_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITHOUT TIME ZONE
);

CREATE TABLE IF NOT EXISTS attendance_records (
    id BIGSERIAL PRIMARY KEY,
    lesson_session_id BIGINT NOT NULL REFERENCES lesson_sessions(id) ON DELETE CASCADE,
    student_id BIGINT NOT NULL REFERENCES students(id) ON DELETE CASCADE,
    status VARCHAR(50) NOT NULL,
    notes TEXT,
    recorded_by VARCHAR(100),
    recorded_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT NOW(),
    updated_by VARCHAR(100),
    updated_at TIMESTAMP WITHOUT TIME ZONE,
    CONSTRAINT uk_session_student UNIQUE (lesson_session_id, student_id)
);

CREATE INDEX IF NOT EXISTS idx_lesson_sessions_date ON lesson_sessions(lesson_date);
CREATE INDEX IF NOT EXISTS idx_lesson_sessions_mentor_date ON lesson_sessions(mentor_id, lesson_date);
CREATE INDEX IF NOT EXISTS idx_attendance_records_session ON attendance_records(lesson_session_id);
