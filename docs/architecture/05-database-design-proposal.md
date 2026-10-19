# 5. Database Design Proposal (Baza Strukturasi Taklifi)

PostgreSQL 16 asosiy ma’lumotlar bazasi hisoblanadi. Barcha jadvallar Liquibase migratsiyalari orqali boshqariladi.

```mermaid
erDiagram
    USERS ||--o{ USER_ROLES : has
    ROLES ||--o{ USER_ROLES : assigned_to
    ROLES ||--o{ ROLE_PERMISSIONS : contains
    PERMISSIONS ||--o{ ROLE_PERMISSIONS : mapped_in

    MENTORS ||--o{ STUDY_GROUPS : leads
    STUDY_GROUPS ||--o{ STUDENTS : enrolls
    MENTORS ||--o{ SCHEDULES : teaches
    STUDY_GROUPS ||--o{ SCHEDULES : assigned

    USERS {
        bigserial id PK
        varchar username UK
        varchar password_hash
        varchar full_name
        varchar email UK
        varchar phone
        boolean enabled
        timestamp created_at
        timestamp updated_at
    }

    ROLES {
        bigserial id PK
        varchar code UK
        varchar name
        varchar description
    }

    PERMISSIONS {
        bigserial id PK
        varchar code UK
        varchar module
        varchar description
    }

    USER_ROLES {
        bigint user_id PK,FK
        bigint role_id PK,FK
        timestamp assigned_at
    }

    STUDENTS {
        bigserial id PK
        varchar full_name
        varchar pinfl UK
        varchar student_id_number UK
        varchar district
        varchar grade_level
        varchar branch_location
        varchar status
        bigint group_id FK
        bigint mentor_id FK
        timestamp created_at
    }

    MENTORS {
        bigserial id PK
        varchar full_name
        varchar role_title
        varchar phone
        varchar email
        varchar branch_location
        text bio
        timestamp created_at
    }

    STUDY_GROUPS {
        bigserial id PK
        varchar group_code UK
        varchar grade_level
        varchar subject
        varchar branch_location
        bigint mentor_id FK
        int student_count
    }

    SCHEDULES {
        bigserial id PK
        bigint group_id FK
        bigint mentor_id FK
        varchar grade_level
        varchar subject
        varchar days
        varchar start_time
        varchar end_time
        varchar room
        varchar topic
        int duration_minutes
    }

    AUDIT_LOGS {
        bigserial id PK
        varchar action
        varchar entity_name
        varchar entity_id
        varchar performed_by
        text details
        timestamp created_at
    }
```

## 5.1. Indekslar va Cheklovlar (Indexes & Constraints)
1. **Unikallik indekslari:**
   - `users(username)` va `users(email)`
   - `students(pinfl)` va `students(student_id_number)`
   - `study_groups(group_code)`
   - `roles(code)`, `permissions(code)`

2. **Qidiruv va Foreign Key indekslari:**
   - `idx_students_group_id` -> `students(group_id)`
   - `idx_students_mentor_id` -> `students(mentor_id)`
   - `idx_schedules_mentor_id` -> `schedules(mentor_id)`
   - `idx_schedules_group_id` -> `schedules(group_id)`
   - `idx_audit_created_at` -> `audit_logs(created_at)`

## 5.2. Vaqt va O‘chirish Siyosati (Timestamp & Retention)
- Barcha vaqtlar (`created_at`, `updated_at`) UTC vaqt mintaqasida (`NOW() AT TIME ZONE 'UTC'`) saqlanadi.
- Frontendga ISO-8601 UTC formatida uzatiladi va foydalanuvchining lokal vaqtiga moslab ko‘rsatiladi.
- Talaba va baholar kabi muhim ta’lim ma’lumotlari uchun jismoniy o‘chirish (Hard Delete) taqiqlanadi; `status` yoki `is_deleted` orqali Soft Delete amalga oshiriladi.
