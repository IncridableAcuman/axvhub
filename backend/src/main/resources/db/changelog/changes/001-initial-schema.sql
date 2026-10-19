--liquibase formatted sql
--changeset izzatbek:001-initial-schema

CREATE TABLE IF NOT EXISTS users (
    id BIGSERIAL PRIMARY KEY,
    username VARCHAR(100) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    email VARCHAR(255),
    phone VARCHAR(50),
    role VARCHAR(50) NOT NULL,
    enabled BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITHOUT TIME ZONE
);

CREATE TABLE IF NOT EXISTS mentors (
    id BIGSERIAL PRIMARY KEY,
    full_name VARCHAR(255) NOT NULL,
    role VARCHAR(100) NOT NULL,
    phone VARCHAR(50),
    email VARCHAR(255),
    branch_location VARCHAR(255),
    bio TEXT,
    created_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITHOUT TIME ZONE
);

CREATE TABLE IF NOT EXISTS study_groups (
    id BIGSERIAL PRIMARY KEY,
    group_code VARCHAR(100) NOT NULL UNIQUE,
    grade_level VARCHAR(50) NOT NULL,
    subject VARCHAR(255),
    branch_location VARCHAR(255),
    schedule_days VARCHAR(255),
    schedule_time VARCHAR(100),
    room VARCHAR(100),
    mentor_id BIGINT REFERENCES mentors(id) ON DELETE SET NULL,
    student_count INT DEFAULT 0,
    created_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITHOUT TIME ZONE
);

CREATE TABLE IF NOT EXISTS rooms (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    branch_location VARCHAR(255),
    capacity INT DEFAULT 16,
    created_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITHOUT TIME ZONE
);

CREATE TABLE IF NOT EXISTS schedules (
    id BIGSERIAL PRIMARY KEY,
    group_id BIGINT REFERENCES study_groups(id) ON DELETE CASCADE,
    mentor_id BIGINT REFERENCES mentors(id) ON DELETE SET NULL,
    grade_level VARCHAR(50) NOT NULL,
    subject VARCHAR(255) NOT NULL,
    days VARCHAR(255) NOT NULL,
    start_time VARCHAR(20) NOT NULL,
    end_time VARCHAR(20) NOT NULL,
    room VARCHAR(100),
    branch_location VARCHAR(255),
    academic_year VARCHAR(50),
    topic VARCHAR(255),
    duration_minutes INT DEFAULT 80,
    created_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITHOUT TIME ZONE
);

CREATE TABLE IF NOT EXISTS students (
    id BIGSERIAL PRIMARY KEY,
    full_name VARCHAR(255) NOT NULL,
    pinfl VARCHAR(14),
    student_id_number VARCHAR(50),
    district VARCHAR(100),
    grade_level VARCHAR(50),
    branch_location VARCHAR(255),
    phone VARCHAR(50),
    direction VARCHAR(255),
    status VARCHAR(50) NOT NULL DEFAULT 'Faol',
    group_id BIGINT REFERENCES study_groups(id) ON DELETE SET NULL,
    mentor_id BIGINT REFERENCES mentors(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITHOUT TIME ZONE
);

CREATE TABLE IF NOT EXISTS audit_logs (
    id BIGSERIAL PRIMARY KEY,
    action VARCHAR(50),
    entity_name VARCHAR(100),
    entity_id VARCHAR(100),
    performed_by VARCHAR(100),
    details TEXT,
    created_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITHOUT TIME ZONE
);
