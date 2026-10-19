# 4. Module Dependency Map (Modullar Bog‘liqlik Xaritasi)

Modular Monolith arxitekturasida modullar o‘rtasida aylanma bog‘liqliklar (circular dependencies) qat’iyan taqiqlanadi. Barcha aloqalar faqat bir tomonlama (Directed Acyclic Graph) bo‘lishi lozim.

```mermaid
graph TD
    Shared["0. Shared Kernel (Domain, App, Web, Security)"]
    Identity["1. Identity & RBAC (Auth, Users, Roles)"]
    Education["2. Education Structure (Regions, Branches, Groups)"]
    Mentors["3. Mentor Profiles"]
    Users["4. Student Profiles"]
    Scheduling["5. Scheduling & Timetable"]
    Lessons["6. Lesson Delivery & Phases"]
    Materials["7. Learning Materials"]
    Assessments["8. Assessments & Assignments"]
    Grading["9. Grading & Gamification"]
    Analytics["10. Analytics & Statistics"]
    Reports["11. Reports & PDF Export"]
    AI["12. AI Assistant & Parser"]
    Notifications["13. Notifications Engine"]
    Audit["14. Audit & Security Logs"]

    Identity --> Shared
    Education --> Shared
    Mentors --> Shared
    Users --> Shared

    Education --> Mentors
    Users --> Education
    Users --> Mentors

    Scheduling --> Education
    Scheduling --> Mentors

    Lessons --> Scheduling
    Materials --> Lessons

    Assessments --> Lessons
    Grading --> Assessments
    Grading --> Users

    Analytics --> Grading
    Analytics --> Users
    Analytics --> Scheduling

    Reports --> Analytics
    Reports --> Users

    AI --> Scheduling
    AI --> Users
    AI --> Shared

    Notifications --> Users
    Audit --> Shared
```

## 4.1. Modullararo Aloqa Qoidalari

1. **Repositoryga to‘g‘ridan-to‘g‘ri murojaat taqiqlanadi:**
   - Masalan, `Scheduling` moduli bevosita `UserRepository` yoki `StudentRepository` ni chaqira olmaydi.
   - Buning o‘rniga `StudentApplicationService` orqali taqdim etilgan DTO va metodlardan foydalaniladi.

2. **Domen Voqealari (Domain Events):**
   - Asinxron yoki zaif bog‘langan (loosely-coupled) amallar uchun Spring Event Publisher (`ApplicationEventPublisher`) ishlatiladi.
   - Misol: `StudentAssignedEvent`, `GradeCalculatedEvent`, `ScheduleUpdatedEvent`.

3. **API Chegaralari:**
   - Har bir modul o‘zining `application` paketida boshqa modullar uchun ommaviy xizmat interfeysini e’lon qiladi. Ichki implementatsiya detallari yashirin qoladi.
