--liquibase formatted sql
--changeset izzatbek:008-modules-08-to-11-schema

-- ============================================================================
-- MODUL 08: Darslarni boshqarish (Lesson Planning & Delivery)
-- ============================================================================

CREATE TABLE IF NOT EXISTS lessons (
    id BIGSERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    subject VARCHAR(100) NOT NULL,
    grade_level VARCHAR(50) NOT NULL,
    topic VARCHAR(255),
    learning_objectives TEXT,
    expected_outcomes TEXT,
    required_materials TEXT,
    theory_content TEXT,
    theory_duration_minutes INT DEFAULT 20,
    practical_content TEXT,
    practical_duration_minutes INT DEFAULT 25,
    exercises TEXT,
    homework TEXT,
    duration_minutes INT NOT NULL DEFAULT 80,
    group_id BIGINT REFERENCES study_groups(id) ON DELETE SET NULL,
    mentor_id BIGINT REFERENCES mentors(id) ON DELETE SET NULL,
    schedule_id BIGINT REFERENCES schedules(id) ON DELETE SET NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'DRAFT',
    actual_outcome TEXT,
    mentor_notes TEXT,
    is_template BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITHOUT TIME ZONE
);

CREATE TABLE IF NOT EXISTS lesson_revisions (
    id BIGSERIAL PRIMARY KEY,
    lesson_id BIGINT NOT NULL REFERENCES lessons(id) ON DELETE CASCADE,
    revision_number INT NOT NULL,
    title VARCHAR(255) NOT NULL,
    content_snapshot TEXT NOT NULL,
    changed_by VARCHAR(100),
    change_summary VARCHAR(255),
    created_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS student_lesson_progress (
    id BIGSERIAL PRIMARY KEY,
    lesson_id BIGINT NOT NULL REFERENCES lessons(id) ON DELETE CASCADE,
    student_id BIGINT NOT NULL REFERENCES students(id) ON DELETE CASCADE,
    status VARCHAR(50) NOT NULL DEFAULT 'ATTENDED',
    score INT DEFAULT 0,
    mentor_feedback TEXT,
    updated_at TIMESTAMP WITHOUT TIME ZONE,
    CONSTRAINT uk_lesson_student UNIQUE(lesson_id, student_id)
);

CREATE INDEX IF NOT EXISTS idx_lessons_group ON lessons(group_id);
CREATE INDEX IF NOT EXISTS idx_lessons_mentor ON lessons(mentor_id);
CREATE INDEX IF NOT EXISTS idx_lessons_status ON lessons(status);

-- ============================================================================
-- MODUL 09: O'quv materiallari va foydali resurslar (Resource Library)
-- ============================================================================

CREATE TABLE IF NOT EXISTS learning_resources (
    id BIGSERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    resource_type VARCHAR(50) NOT NULL,
    file_name VARCHAR(255),
    file_extension VARCHAR(50),
    file_size BIGINT,
    storage_key VARCHAR(500),
    mime_type VARCHAR(100),
    external_url TEXT,
    subject VARCHAR(100),
    grade_level VARCHAR(50),
    topic VARCHAR(255),
    tags VARCHAR(255),
    lesson_id BIGINT REFERENCES lessons(id) ON DELETE SET NULL,
    mentor_id BIGINT REFERENCES mentors(id) ON DELETE SET NULL,
    publication_status VARCHAR(50) NOT NULL DEFAULT 'PUBLISHED',
    is_public BOOLEAN NOT NULL DEFAULT TRUE,
    download_count INT NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITHOUT TIME ZONE
);

CREATE INDEX IF NOT EXISTS idx_learning_resources_subject ON learning_resources(subject);
CREATE INDEX IF NOT EXISTS idx_learning_resources_grade ON learning_resources(grade_level);
CREATE INDEX IF NOT EXISTS idx_learning_resources_type ON learning_resources(resource_type);

-- ============================================================================
-- MODUL 10: Testlar va mustaqil mashqlar (Assessments & Quizzes)
-- ============================================================================

CREATE TABLE IF NOT EXISTS assessments (
    id BIGSERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    subject VARCHAR(100) NOT NULL,
    grade_level VARCHAR(50) NOT NULL,
    topic VARCHAR(255),
    assessment_type VARCHAR(50) NOT NULL DEFAULT 'QUIZ',
    total_points INT NOT NULL DEFAULT 100,
    passing_score INT NOT NULL DEFAULT 60,
    duration_minutes INT DEFAULT 45,
    start_time TIMESTAMP WITHOUT TIME ZONE,
    end_time TIMESTAMP WITHOUT TIME ZONE,
    max_attempts INT NOT NULL DEFAULT 1,
    randomize_questions BOOLEAN NOT NULL DEFAULT FALSE,
    show_correct_answers BOOLEAN NOT NULL DEFAULT FALSE,
    is_published BOOLEAN NOT NULL DEFAULT FALSE,
    group_id BIGINT REFERENCES study_groups(id) ON DELETE SET NULL,
    created_by_mentor_id BIGINT REFERENCES mentors(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITHOUT TIME ZONE
);

CREATE TABLE IF NOT EXISTS assessment_questions (
    id BIGSERIAL PRIMARY KEY,
    assessment_id BIGINT NOT NULL REFERENCES assessments(id) ON DELETE CASCADE,
    question_text TEXT NOT NULL,
    question_type VARCHAR(50) NOT NULL,
    points INT NOT NULL DEFAULT 10,
    order_index INT NOT NULL DEFAULT 0,
    options_json TEXT,
    correct_answers_json TEXT,
    explanation TEXT
);

CREATE TABLE IF NOT EXISTS student_assessment_attempts (
    id BIGSERIAL PRIMARY KEY,
    assessment_id BIGINT NOT NULL REFERENCES assessments(id) ON DELETE CASCADE,
    student_id BIGINT NOT NULL REFERENCES students(id) ON DELETE CASCADE,
    attempt_number INT NOT NULL DEFAULT 1,
    started_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT NOW(),
    submitted_at TIMESTAMP WITHOUT TIME ZONE,
    time_spent_seconds INT DEFAULT 0,
    total_score INT DEFAULT 0,
    max_possible_score INT DEFAULT 0,
    percentage DOUBLE PRECISION DEFAULT 0.0,
    status VARCHAR(50) NOT NULL DEFAULT 'IN_PROGRESS',
    mentor_feedback TEXT,
    graded_by_mentor_id BIGINT REFERENCES mentors(id) ON DELETE SET NULL,
    graded_at TIMESTAMP WITHOUT TIME ZONE
);

CREATE TABLE IF NOT EXISTS student_answers (
    id BIGSERIAL PRIMARY KEY,
    attempt_id BIGINT NOT NULL REFERENCES student_assessment_attempts(id) ON DELETE CASCADE,
    question_id BIGINT NOT NULL REFERENCES assessment_questions(id) ON DELETE CASCADE,
    student_answer_text TEXT,
    selected_options_json TEXT,
    earned_points INT DEFAULT 0,
    is_correct BOOLEAN,
    mentor_feedback TEXT,
    CONSTRAINT uk_attempt_question UNIQUE(attempt_id, question_id)
);

CREATE TABLE IF NOT EXISTS assignments (
    id BIGSERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    subject VARCHAR(100) NOT NULL,
    grade_level VARCHAR(50),
    group_id BIGINT REFERENCES study_groups(id) ON DELETE SET NULL,
    mentor_id BIGINT REFERENCES mentors(id) ON DELETE SET NULL,
    deadline TIMESTAMP WITHOUT TIME ZONE,
    max_points INT NOT NULL DEFAULT 100,
    attachment_url TEXT,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITHOUT TIME ZONE
);

CREATE TABLE IF NOT EXISTS assignment_submissions (
    id BIGSERIAL PRIMARY KEY,
    assignment_id BIGINT NOT NULL REFERENCES assignments(id) ON DELETE CASCADE,
    student_id BIGINT NOT NULL REFERENCES students(id) ON DELETE CASCADE,
    submission_text TEXT,
    file_url TEXT,
    submitted_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT NOW(),
    status VARCHAR(50) NOT NULL DEFAULT 'PENDING',
    score INT,
    feedback TEXT,
    graded_by_mentor_id BIGINT REFERENCES mentors(id) ON DELETE SET NULL,
    graded_at TIMESTAMP WITHOUT TIME ZONE,
    CONSTRAINT uk_assignment_student UNIQUE(assignment_id, student_id)
);

CREATE INDEX IF NOT EXISTS idx_assessments_group ON assessments(group_id);
CREATE INDEX IF NOT EXISTS idx_attempts_student ON student_assessment_attempts(student_id);
CREATE INDEX IF NOT EXISTS idx_attempts_assessment ON student_assessment_attempts(assessment_id);

-- ============================================================================
-- MODUL 11: Ballar, reyting va gamifikatsiya (Grading & Gamification)
-- ============================================================================

CREATE TABLE IF NOT EXISTS grade_records (
    id BIGSERIAL PRIMARY KEY,
    student_id BIGINT NOT NULL REFERENCES students(id) ON DELETE CASCADE,
    subject VARCHAR(100) NOT NULL,
    grade_level VARCHAR(50) NOT NULL,
    academic_period_id BIGINT REFERENCES academic_periods(id) ON DELETE SET NULL,
    evaluation_type VARCHAR(50) NOT NULL,
    score INT NOT NULL,
    max_score INT NOT NULL DEFAULT 100,
    letter_grade VARCHAR(5),
    is_passing BOOLEAN NOT NULL DEFAULT TRUE,
    comments TEXT,
    mentor_id BIGINT REFERENCES mentors(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITHOUT TIME ZONE
);

CREATE TABLE IF NOT EXISTS point_transactions (
    id BIGSERIAL PRIMARY KEY,
    student_id BIGINT NOT NULL REFERENCES students(id) ON DELETE CASCADE,
    amount INT NOT NULL,
    point_source VARCHAR(50) NOT NULL,
    reference_id VARCHAR(100),
    reference_type VARCHAR(100),
    idempotency_key VARCHAR(150) UNIQUE,
    reason VARCHAR(255) NOT NULL,
    awarded_by_user_id BIGINT REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS achievements (
    id BIGSERIAL PRIMARY KEY,
    code VARCHAR(50) NOT NULL UNIQUE,
    title VARCHAR(150) NOT NULL,
    description TEXT NOT NULL,
    icon VARCHAR(50) NOT NULL,
    badge_color VARCHAR(50) NOT NULL DEFAULT 'blue',
    category VARCHAR(50) NOT NULL,
    xp_reward INT NOT NULL DEFAULT 50,
    criteria_type VARCHAR(50) NOT NULL,
    criteria_threshold INT NOT NULL DEFAULT 1,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS student_achievements (
    id BIGSERIAL PRIMARY KEY,
    student_id BIGINT NOT NULL REFERENCES students(id) ON DELETE CASCADE,
    achievement_id BIGINT NOT NULL REFERENCES achievements(id) ON DELETE CASCADE,
    unlocked_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT NOW(),
    progress_value INT DEFAULT 0,
    CONSTRAINT uk_student_achievement UNIQUE(student_id, achievement_id)
);

CREATE INDEX IF NOT EXISTS idx_point_transactions_student ON point_transactions(student_id);
CREATE INDEX IF NOT EXISTS idx_grade_records_student ON grade_records(student_id);
CREATE INDEX IF NOT EXISTS idx_achievements_code ON achievements(code);
