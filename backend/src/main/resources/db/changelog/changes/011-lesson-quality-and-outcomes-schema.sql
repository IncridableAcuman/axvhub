-- ==============================================================================
-- Schema Changelog 011: Lesson Quality & Learning Outcomes (Section 25)
-- ==============================================================================

-- 1. Lesson Quality Plans (Structured lesson planning, objectives, competencies)
CREATE TABLE IF NOT EXISTS lesson_quality_plans (
    id BIGSERIAL PRIMARY KEY,
    lesson_id BIGINT NOT NULL REFERENCES lessons(id) ON DELETE CASCADE,
    learning_objectives TEXT, -- JSON array of objectives: [{"id": "LO-1", "title": "...", "bloomLevel": "..."}]
    expected_competencies TEXT,
    required_prior_knowledge TEXT,
    theory_duration_minutes INT DEFAULT 20,
    practical_duration_minutes INT DEFAULT 30,
    teaching_methods TEXT,
    required_materials TEXT,
    assessment_criteria TEXT,
    expected_student_outcomes TEXT,
    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uk_lesson_quality_plan_lesson UNIQUE (lesson_id)
);

CREATE INDEX IF NOT EXISTS idx_quality_plans_lesson_id ON lesson_quality_plans(lesson_id);

-- 2. Lesson Delivery Records (Actual delivery metrics, difficulties, mentor reflection)
CREATE TABLE IF NOT EXISTS lesson_delivery_records (
    id BIGSERIAL PRIMARY KEY,
    lesson_id BIGINT NOT NULL REFERENCES lessons(id) ON DELETE CASCADE,
    mentor_id BIGINT REFERENCES users(id) ON DELETE SET NULL,
    actual_duration_minutes INT DEFAULT 80,
    topics_covered TEXT,
    practical_exercises_completed INT DEFAULT 0,
    common_difficulties TEXT,
    student_participation_rate DECIMAL(5,2) DEFAULT 100.00,
    homework_assigned TEXT,
    topics_requiring_revision TEXT,
    what_worked_well TEXT,
    needs_further_explanation TEXT,
    exercise_difficulty VARCHAR(30) DEFAULT 'BALANCED', -- TOO_EASY, BALANCED, TOO_DIFFICULT
    change_next_time TEXT,
    recorded_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_delivery_records_lesson_id ON lesson_delivery_records(lesson_id);
CREATE INDEX IF NOT EXISTS idx_delivery_records_mentor_id ON lesson_delivery_records(mentor_id);

-- 3. Student Learning Outcome Evaluations (Objective evaluation per student, evidence-based)
CREATE TABLE IF NOT EXISTS student_learning_outcome_evaluations (
    id BIGSERIAL PRIMARY KEY,
    lesson_id BIGINT NOT NULL REFERENCES lessons(id) ON DELETE CASCADE,
    student_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    objective_id VARCHAR(64) NOT NULL,
    objective_title VARCHAR(255) NOT NULL,
    status VARCHAR(32) NOT NULL DEFAULT 'NOT_EVALUATED', -- NOT_EVALUATED, INTRODUCED, DEVELOPING, ACHIEVED, MASTERED
    evidence_source VARCHAR(32) NOT NULL DEFAULT 'MENTOR_OBSERVATION', -- QUIZ_RESULT, ASSIGNMENT_SUBMISSION, MENTOR_OBSERVATION
    evidence_score DECIMAL(5,2),
    mentor_notes TEXT,
    evaluated_by VARCHAR(100),
    evaluated_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uk_student_lesson_objective UNIQUE (lesson_id, student_id, objective_id)
);

CREATE INDEX IF NOT EXISTS idx_outcome_eval_student ON student_learning_outcome_evaluations(student_id);
CREATE INDEX IF NOT EXISTS idx_outcome_eval_lesson ON student_learning_outcome_evaluations(lesson_id);
CREATE INDEX IF NOT EXISTS idx_outcome_eval_status ON student_learning_outcome_evaluations(status);
