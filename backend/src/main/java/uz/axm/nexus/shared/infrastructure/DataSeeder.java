package uz.axm.nexus.shared.infrastructure;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import uz.axm.nexus.access.domain.Permission;
import uz.axm.nexus.access.domain.Role;
import uz.axm.nexus.access.infrastructure.PermissionRepository;
import uz.axm.nexus.access.infrastructure.RoleRepository;
import uz.axm.nexus.classrooms.domain.GroupMembership;
import uz.axm.nexus.classrooms.domain.StudyGroup;
import uz.axm.nexus.classrooms.infrastructure.GroupMembershipRepository;
import uz.axm.nexus.classrooms.infrastructure.StudyGroupRepository;
import uz.axm.nexus.education.domain.AcademicPeriod;
import uz.axm.nexus.education.infrastructure.AcademicPeriodRepository;
import uz.axm.nexus.mentors.domain.Mentor;
import uz.axm.nexus.mentors.domain.MentorProfile;
import uz.axm.nexus.mentors.domain.MentorSkill;
import uz.axm.nexus.mentors.domain.MentorExperience;
import uz.axm.nexus.mentors.domain.MentorEducation;
import uz.axm.nexus.mentors.infrastructure.MentorProfileRepository;
import uz.axm.nexus.mentors.infrastructure.MentorRepository;
import uz.axm.nexus.mentors.infrastructure.MentorSkillRepository;
import uz.axm.nexus.mentors.infrastructure.MentorExperienceRepository;
import uz.axm.nexus.mentors.infrastructure.MentorEducationRepository;
import uz.axm.nexus.scheduling.domain.AttendanceRecord;
import uz.axm.nexus.scheduling.domain.LessonSession;
import uz.axm.nexus.scheduling.domain.Schedule;
import uz.axm.nexus.scheduling.infrastructure.AttendanceRecordRepository;
import uz.axm.nexus.scheduling.infrastructure.LessonSessionRepository;
import uz.axm.nexus.scheduling.infrastructure.ScheduleRepository;
import uz.axm.nexus.users.domain.Student;
import uz.axm.nexus.users.domain.User;
import uz.axm.nexus.users.infrastructure.StudentRepository;
import uz.axm.nexus.users.infrastructure.UserRepository;

import uz.axm.nexus.assessments.domain.Assessment;
import uz.axm.nexus.assessments.domain.AssessmentQuestion;
import uz.axm.nexus.assessments.domain.StudentAssessmentAttempt;
import uz.axm.nexus.assessments.infrastructure.AssessmentQuestionRepository;
import uz.axm.nexus.assessments.infrastructure.AssessmentRepository;
import uz.axm.nexus.assessments.infrastructure.StudentAssessmentAttemptRepository;
import uz.axm.nexus.assignments.domain.Assignment;
import uz.axm.nexus.assignments.domain.AssignmentSubmission;
import uz.axm.nexus.assignments.infrastructure.AssignmentRepository;
import uz.axm.nexus.assignments.infrastructure.AssignmentSubmissionRepository;
import uz.axm.nexus.grading.domain.GradeRecord;
import uz.axm.nexus.grading.infrastructure.GradeRecordRepository;
import uz.axm.nexus.lessons.domain.Lesson;
import uz.axm.nexus.lessons.domain.StudentLessonProgress;
import uz.axm.nexus.lessons.infrastructure.LessonRepository;
import uz.axm.nexus.lessons.infrastructure.StudentLessonProgressRepository;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.*;

@Component
@RequiredArgsConstructor
@Slf4j
public class DataSeeder implements CommandLineRunner {

    private final MentorRepository mentorRepository;
    private final StudyGroupRepository studyGroupRepository;
    private final ScheduleRepository scheduleRepository;
    private final StudentRepository studentRepository;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final RoleRepository roleRepository;
    private final PermissionRepository permissionRepository;
    private final AcademicPeriodRepository academicPeriodRepository;
    private final GroupMembershipRepository groupMembershipRepository;
    private final MentorProfileRepository mentorProfileRepository;
    private final MentorSkillRepository mentorSkillRepository;
    private final MentorExperienceRepository mentorExperienceRepository;
    private final MentorEducationRepository mentorEducationRepository;
    private final LessonSessionRepository lessonSessionRepository;
    private final AttendanceRecordRepository attendanceRecordRepository;
    private final LessonRepository lessonRepository;
    private final StudentLessonProgressRepository studentLessonProgressRepository;
    private final AssessmentRepository assessmentRepository;
    private final AssessmentQuestionRepository assessmentQuestionRepository;
    private final StudentAssessmentAttemptRepository studentAssessmentAttemptRepository;
    private final AssignmentRepository assignmentRepository;
    private final AssignmentSubmissionRepository assignmentSubmissionRepository;
    private final GradeRecordRepository gradeRecordRepository;
    private final uz.axm.nexus.notifications.infrastructure.NotificationRepository notificationRepository;
    private final uz.axm.nexus.notifications.infrastructure.NotificationPreferenceRepository notificationPreferenceRepository;
    private final uz.axm.nexus.users.infrastructure.UserPreferenceRepository userPreferenceRepository;
    private final uz.axm.nexus.audit.infrastructure.AuditLogRepository auditLogRepository;
    private final uz.axm.nexus.audit.infrastructure.SystemConfigRepository systemConfigRepository;

    @Override
    public void run(String... args) {
        seedRbacSystem();
        seedDefaultAdmin();

        if (mentorRepository.count() == 0) {
            seedCoreEntities();
        }

        seedMentorProfileDetails();

        if (assessmentRepository.count() == 0) {
            seedOperationalLearningData();
        }

        seedModule14To16Data();
    }

    private void seedCoreEntities() {

        log.info("Seeding initial authentic data for AXV Hub (Nexus)...");

        // 1. Academic Period
        AcademicPeriod period = academicPeriodRepository.save(AcademicPeriod.builder()
                .name("2026-2027 O'quv yili (Kuzgi semestr)")
                .code("AY-2026-F")
                .startDate(LocalDate.now().minusMonths(1))
                .endDate(LocalDate.now().plusMonths(5))
                .isActive(true)
                .build());

        // 2. Mentors
        Mentor mentorIzzatbek = mentorRepository.save(Mentor.builder()
                .fullName("Abdusharipov Izzatbek quranboy o'g'li")
                .role("IT mentor")
                .phone("+998 90 123 45 67")
                .email("abdusharipovizzat03@gmail.com")
                .branchLocation("IT Park Yangiariq")
                .bio("Al-Xorazmiy Vorislari loyihasi IT mentori, Web Full-stack va Advanced Front-end o'qituvchisi.")
                .build());

        Mentor mentorDilnoza = mentorRepository.save(Mentor.builder()
                .fullName("Raximova Dilnoza Sanjarbek qizi")
                .role("Ingliz tili mentor")
                .phone("+998 91 987 65 43")
                .email("dilnoza.eng@gmail.com")
                .branchLocation("IT Park Yangiariq")
                .bio("IT English va xalqaro muloqot ko'nikmalari mentori.")
                .build());

        // 3. Mentor Profiles (Module 06)
        MentorProfile profileIzzatbek = mentorProfileRepository.save(MentorProfile.builder()
                .mentor(mentorIzzatbek)
                .displayName("Abdusharipov Izzatbek")
                .headline("Al-Xorazmiy Vorislari IT Mentori (Web Full-stack & Frontend)")
                .bio("Web Full-Stack, React, TypeScript va Zamonaviy Veb Texnologiyalari bo'yicha amaliyotchi mentor.")
                .yearsOfExperience(4)
                .branchLocation("IT Park Yangiariq")
                .phone("+998 90 123 45 67")
                .email("abdusharipovizzat03@gmail.com")
                .isContactPublic(true)
                .githubUrl("https://github.com/izzatbek-dev")
                .linkedinUrl("https://linkedin.com/in/izzatbek-abdurasharipov")
                .portfolioUrl("https://axm-nexus.uz/mentors/izzatbek")
                .publicationStatus("PUBLISHED")
                .build());

        profileIzzatbek.getSkills().addAll(List.of(
                MentorSkill.builder().profile(profileIzzatbek).skillName("React & TypeScript").proficiencyLevel("EXPERT").category("Frontend").build(),
                MentorSkill.builder().profile(profileIzzatbek).skillName("Spring Boot & Java").proficiencyLevel("EXPERT").category("Backend").build(),
                MentorSkill.builder().profile(profileIzzatbek).skillName("PostgreSQL").proficiencyLevel("ADVANCED").category("Database").build(),
                MentorSkill.builder().profile(profileIzzatbek).skillName("Tailwind CSS").proficiencyLevel("EXPERT").category("Frontend").build()
        ));
        mentorProfileRepository.save(profileIzzatbek);

        // 4. Study Groups (Module 05)
        StudyGroup group8 = studyGroupRepository.save(StudyGroup.builder()
                .groupCode("YA-26I0804")
                .gradeLevel("8-sinf")
                .subject("Web Full-stack dasturlash asoslari")
                .branchLocation("IT Park Yangiariq")
                .scheduleDays("Seshanba-Payshanba-Shanba")
                .scheduleTime("15:00-16:30")
                .room("IT-2")
                .mentor(mentorIzzatbek)
                .academicPeriod(period)
                .status("ACTIVE")
                .maxCapacity(16)
                .studentCount(14)
                .build());

        StudyGroup group11 = studyGroupRepository.save(StudyGroup.builder()
                .groupCode("YA-24I1105")
                .gradeLevel("11-sinf")
                .subject("Advanced UX/UI dizayn va Advanced Front-end")
                .branchLocation("IT Park Yangiariq")
                .scheduleDays("Dushanba-Chorshanba-Juma")
                .scheduleTime("16:30-18:00")
                .room("IT-2")
                .mentor(mentorIzzatbek)
                .academicPeriod(period)
                .status("ACTIVE")
                .maxCapacity(16)
                .studentCount(15)
                .build());

        // 5. Schedules (Timetable template)
        Schedule sched8 = scheduleRepository.save(Schedule.builder()
                .studyGroup(group8)
                .mentor(mentorIzzatbek)
                .gradeLevel("8-sinf")
                .subject("Web Full-stack dasturlash asoslari")
                .days("Seshanba, Payshanba, Shanba")
                .startTime("15:00")
                .endTime("16:30")
                .room("IT-2")
                .branchLocation("IT Park Yangiariq")
                .academicYear("2026-2027")
                .topic("Web Full-stack dasturlash asoslari (HTML, CSS, JS)")
                .durationMinutes(90)
                .build());

        Schedule sched11 = scheduleRepository.save(Schedule.builder()
                .studyGroup(group11)
                .mentor(mentorIzzatbek)
                .gradeLevel("11-sinf")
                .subject("Advanced UX/UI dizayn va Advanced Front-end")
                .days("Dushanba, Chorshanba, Juma")
                .startTime("16:30")
                .endTime("18:00")
                .room("IT-2")
                .branchLocation("IT Park Yangiariq")
                .academicYear("2026-2027")
                .topic("Advanced UX/UI dizayn va Advanced Front-end (React & TypeScript)")
                .durationMinutes(90)
                .build());

        // 6. Students (15 in YA-24I1105, 14 in YA-26I0804)
        List<Student> students = List.of(
                // YA-24I1105 (11-sinf)
                Student.builder().fullName("Quvandiqov Asadbek Yarashbek o'g'li").studentIdNumber("I-HR 0220243").pinfl("50711097180010").district("Yangiariq tumani").gradeLevel("11-sinf").branchLocation("IT Park Yangiariq").status("Faol").studyGroup(group11).mentor(mentorIzzatbek).build(),
                Student.builder().fullName("Sadaddinov Mirjalol Muxammadjon o'g'li").studentIdNumber("I-HR 0220244").pinfl("50711097180011").district("Yangiariq tumani").gradeLevel("11-sinf").branchLocation("IT Park Yangiariq").status("Faol").studyGroup(group11).mentor(mentorIzzatbek).build(),
                Student.builder().fullName("Husainova Charos Baxtiyor qizi").studentIdNumber("I-HR 0220245").pinfl("50711097180012").district("Yangiariq tumani").gradeLevel("11-sinf").branchLocation("IT Park Yangiariq").status("Faol").studyGroup(group11).mentor(mentorIzzatbek).build(),
                Student.builder().fullName("Bekchanova Sevinchoy Baxodir qizi").studentIdNumber("I-HR 0220246").pinfl("50711097180013").district("Yangiariq tumani").gradeLevel("11-sinf").branchLocation("IT Park Yangiariq").status("Faol").studyGroup(group11).mentor(mentorIzzatbek).build(),
                Student.builder().fullName("Arkayeva Shabnam Temur qizi").studentIdNumber("I-HR 0220247").pinfl("50711097180014").district("Yangiariq tumani").gradeLevel("11-sinf").branchLocation("IT Park Yangiariq").status("Faol").studyGroup(group11).mentor(mentorIzzatbek).build(),
                Student.builder().fullName("Ernazarova Safura Faxriddin qizi").studentIdNumber("I-HR 0220248").pinfl("50711097180015").district("Yangiariq tumani").gradeLevel("11-sinf").branchLocation("IT Park Yangiariq").status("Faol").studyGroup(group11).mentor(mentorIzzatbek).build(),
                Student.builder().fullName("Farhodova Zebuzar Tohir qizi").studentIdNumber("I-HR 0220249").pinfl("50711097180016").district("Yangiariq tumani").gradeLevel("11-sinf").branchLocation("IT Park Yangiariq").status("Faol").studyGroup(group11).mentor(mentorIzzatbek).build(),
                Student.builder().fullName("Shonazarov Dilshodbek Oybek o'g'li").studentIdNumber("I-HR 0220250").pinfl("50711097180017").district("Yangiariq tumani").gradeLevel("11-sinf").branchLocation("IT Park Yangiariq").status("Faol").studyGroup(group11).mentor(mentorIzzatbek).build(),
                Student.builder().fullName("Jonibekova Diana Ruslon qizi").studentIdNumber("I-HR 0220251").pinfl("50711097180018").district("Yangiariq tumani").gradeLevel("11-sinf").branchLocation("IT Park Yangiariq").status("Faol").studyGroup(group11).mentor(mentorIzzatbek).build(),
                Student.builder().fullName("Ibodullayeva Hilola Kamolladin qizi").studentIdNumber("I-HR 0220252").pinfl("50711097180019").district("Yangiariq tumani").gradeLevel("11-sinf").branchLocation("IT Park Yangiariq").status("Faol").studyGroup(group11).mentor(mentorIzzatbek).build(),
                Student.builder().fullName("Olimboyeva Sabina Jo'rabek qizi").studentIdNumber("I-HR 0220253").pinfl("50711097180020").district("Yangiariq tumani").gradeLevel("11-sinf").branchLocation("IT Park Yangiariq").status("Faol").studyGroup(group11).mentor(mentorIzzatbek).build(),
                Student.builder().fullName("Boltayeva Farangiz Bekzod qizi").studentIdNumber("I-HR 0220254").pinfl("50711097180021").district("Yangiariq tumani").gradeLevel("11-sinf").branchLocation("IT Park Yangiariq").status("Faol").studyGroup(group11).mentor(mentorIzzatbek).build(),
                Student.builder().fullName("Ro'ziboyev Anvarbek Sanjarbek o'g'li").studentIdNumber("I-HR 0220255").pinfl("50711097180022").district("Yangiariq tumani").gradeLevel("11-sinf").branchLocation("IT Park Yangiariq").status("Faol").studyGroup(group11).mentor(mentorIzzatbek).build(),
                Student.builder().fullName("Matyoqubov Sulaymon Murodjon o'g'li").studentIdNumber("I-HR 0220256").pinfl("50711097180023").district("Yangiariq tumani").gradeLevel("11-sinf").branchLocation("IT Park Yangiariq").status("Faol").studyGroup(group11).mentor(mentorIzzatbek).build(),
                Student.builder().fullName("Bozorov Shohruhxon Qudrat o'g'li").studentIdNumber("I-HR 0220257").pinfl("50711097180024").district("Yangiariq tumani").gradeLevel("11-sinf").branchLocation("IT Park Yangiariq").status("Faol").studyGroup(group11).mentor(mentorIzzatbek).build(),

                // YA-26I0804 (8-sinf)
                Student.builder().fullName("Komiljonov Kamronbek Doniyor Ogli").studentIdNumber("I-HR 0220201").pinfl("50711097180025").district("Yangiariq tumani").gradeLevel("8-sinf").branchLocation("IT Park Yangiariq").status("Faol").studyGroup(group8).mentor(mentorIzzatbek).build(),
                Student.builder().fullName("Rustamova Zarina Dilshod qizi").studentIdNumber("I-HR 0220202").pinfl("50711097180026").district("Yangiariq tumani").gradeLevel("8-sinf").branchLocation("IT Park Yangiariq").status("Faol").studyGroup(group8).mentor(mentorIzzatbek).build(),
                Student.builder().fullName("Shermatov Shermatjon Davronbekovich").studentIdNumber("I-HR 0220203").pinfl("50711097180027").district("Yangiariq tumani").gradeLevel("8-sinf").branchLocation("IT Park Yangiariq").status("Faol").studyGroup(group8).mentor(mentorIzzatbek).build(),
                Student.builder().fullName("Samandarov Behruzbek Sherzod O'g'il").studentIdNumber("I-HR 0220204").pinfl("50711097180028").district("Yangiariq tumani").gradeLevel("8-sinf").branchLocation("IT Park Yangiariq").status("Faol").studyGroup(group8).mentor(mentorIzzatbek).build(),
                Student.builder().fullName("Olimboyev Ziyodulla Muhiddin").studentIdNumber("I-HR 0220205").pinfl("50711097180029").district("Yangiariq tumani").gradeLevel("8-sinf").branchLocation("IT Park Yangiariq").status("Faol").studyGroup(group8).mentor(mentorIzzatbek).build(),
                Student.builder().fullName("Sobirov Akbarbek Anvarbek o'g'li").studentIdNumber("I-HR 0220206").pinfl("50711097180030").district("Yangiariq tumani").gradeLevel("8-sinf").branchLocation("IT Park Yangiariq").status("Faol").studyGroup(group8).mentor(mentorIzzatbek).build(),
                Student.builder().fullName("Rajabov Diyorbek Doniyor O'g'li").studentIdNumber("I-HR 0220207").pinfl("50711097180031").district("Yangiariq tumani").gradeLevel("8-sinf").branchLocation("IT Park Yangiariq").status("Faol").studyGroup(group8).mentor(mentorIzzatbek).build(),
                Student.builder().fullName("Tajiboyev Adhambek O'lmas O'g'li").studentIdNumber("I-HR 0220208").pinfl("50711097180032").district("Yangiariq tumani").gradeLevel("8-sinf").branchLocation("IT Park Yangiariq").status("Faol").studyGroup(group8).mentor(mentorIzzatbek).build(),
                Student.builder().fullName("Yusupova Shabnam Matyoqub Qizi").studentIdNumber("I-HR 0220209").pinfl("50711097180033").district("Yangiariq tumani").gradeLevel("8-sinf").branchLocation("IT Park Yangiariq").status("Faol").studyGroup(group8).mentor(mentorIzzatbek).build(),
                Student.builder().fullName("Komiljonov Sanjarbek Dilmurod O'g'li").studentIdNumber("I-HR 0220210").pinfl("50711097180034").district("Yangiariq tumani").gradeLevel("8-sinf").branchLocation("IT Park Yangiariq").status("Faol").studyGroup(group8).mentor(mentorIzzatbek).build(),
                Student.builder().fullName("Ismoilov Elmurod Dilmurod O'g'li").studentIdNumber("I-HR 0220211").pinfl("50711097180035").district("Yangiariq tumani").gradeLevel("8-sinf").branchLocation("IT Park Yangiariq").status("Faol").studyGroup(group8).mentor(mentorIzzatbek).build(),
                Student.builder().fullName("Qadamboyev Otabek Dilshod").studentIdNumber("I-HR 0220212").pinfl("50711097180036").district("Yangiariq tumani").gradeLevel("8-sinf").branchLocation("IT Park Yangiariq").status("Faol").studyGroup(group8).mentor(mentorIzzatbek).build(),
                Student.builder().fullName("Rozmetov Rozmatbek Beksod").studentIdNumber("I-HR 0220213").pinfl("50711097180037").district("Yangiariq tumani").gradeLevel("8-sinf").branchLocation("IT Park Yangiariq").status("Faol").studyGroup(group8).mentor(mentorIzzatbek).build(),
                Student.builder().fullName("Ozodova E'zoza El'brus").studentIdNumber("I-HR 0220214").pinfl("50711097180038").district("Yangiariq tumani").gradeLevel("8-sinf").branchLocation("IT Park Yangiariq").status("Faol").studyGroup(group8).mentor(mentorIzzatbek).build()
        );
        List<Student> savedStudents = studentRepository.saveAll(students);

        // 7. Group Memberships (Module 05)
        for (Student s : savedStudents) {
            if (s.getStudyGroup() != null) {
                groupMembershipRepository.save(GroupMembership.builder()
                        .student(s)
                        .group(s.getStudyGroup())
                        .status("ACTIVE")
                        .enrolledAt(LocalDateTime.now().minusWeeks(2))
                        .build());
            }
        }

        // 8. Sample Lesson Sessions & Attendance (Module 07)
        LocalDate today = LocalDate.now();
        LessonSession todaySession = lessonSessionRepository.save(LessonSession.builder()
                .schedule(sched8)
                .group(group8)
                .mentor(mentorIzzatbek)
                .room("IT Lab 1")
                .subject("Web Full-Stack Development")
                .topic("CSS Flexbox va Grid bilan zamonaviy maketlash")
                .lessonDate(today)
                .startTime("15:00")
                .endTime("16:30")
                .status("COMPLETED")
                .build());

        // Attendance records for today's session
        List<GroupMembership> g8Members = groupMembershipRepository.findByGroupIdAndStatus(group8.getId(), "ACTIVE");
        int count = 0;
        for (GroupMembership gm : g8Members) {
            String status = (count % 4 == 3) ? "ABSENT" : ((count % 4 == 2) ? "LATE" : "PRESENT");
            attendanceRecordRepository.save(AttendanceRecord.builder()
                    .lessonSession(todaySession)
                    .student(gm.getStudent())
                    .status(status)
                    .recordedBy("admin")
                    .recordedAt(LocalDateTime.now())
                    .notes(status.equals("LATE") ? "10 daqiqa kechikib keldi" : null)
                    .build());
            count++;
        }

        log.info("AXV Hub initial data successfully seeded!");
    }

    private void seedMentorProfileDetails() {
        mentorProfileRepository.findByMentorId(1L).ifPresent(profile -> {
            if (mentorSkillRepository.findByProfileId(profile.getId()).isEmpty()) {
                mentorSkillRepository.saveAll(List.of(
                        MentorSkill.builder().profile(profile).skillName("React & TypeScript").proficiencyLevel("EXPERT").category("Frontend").build(),
                        MentorSkill.builder().profile(profile).skillName("Spring Boot & Java").proficiencyLevel("ADVANCED").category("Backend").build(),
                        MentorSkill.builder().profile(profile).skillName("PostgreSQL").proficiencyLevel("ADVANCED").category("Database").build(),
                        MentorSkill.builder().profile(profile).skillName("Tailwind CSS & UI/UX").proficiencyLevel("EXPERT").category("Frontend").build(),
                        MentorSkill.builder().profile(profile).skillName("REST API & Full-Stack").proficiencyLevel("EXPERT").category("Full-Stack").build()
                ));
            }
            if (mentorExperienceRepository.findByProfileId(profile.getId()).isEmpty()) {
                mentorExperienceRepository.saveAll(List.of(
                        MentorExperience.builder()
                                .profile(profile)
                                .companyName("Al-Xorazmiy Vorislari ta'lim loyihasi")
                                .roleTitle("Bosh IT Mentori & Web Dasturchi")
                                .description("8 va 11-sinf iqtidorli o'quvchilariga Web Full-stack va zamonaviy Frontend texnologiyalaridan amaliy dars berish, o'quv dasturlarini ishlab chiqish va loyihalar mentorligi.")
                                .startDate(LocalDate.of(2023, 9, 1))
                                .isCurrent(true)
                                .build(),
                        MentorExperience.builder()
                                .profile(profile)
                                .companyName("IT Park Yangiariq / Freelance")
                                .roleTitle("Full-Stack Web Dasturchi")
                                .description("React, Next.js, Node.js va Spring Boot asosida tijoriy veb-ilovalarni yaratish va integratsiyalash.")
                                .startDate(LocalDate.of(2021, 2, 1))
                                .endDate(LocalDate.of(2023, 8, 31))
                                .isCurrent(false)
                                .build()
                ));
            }
            if (mentorEducationRepository.findByProfileId(profile.getId()).isEmpty()) {
                mentorEducationRepository.saveAll(List.of(
                        MentorEducation.builder()
                                .profile(profile)
                                .institution("Muhammad al-Xorazmiy nomidagi TATU Urganch filiali")
                                .degreeOrCertificate("Bakalavr")
                                .fieldOfStudy("Dasturiy injiniring va IT")
                                .issueYear(2024)
                                .verificationStatus("VERIFIED")
                                .build()
                ));
            }
            log.info("Mentor 1 (Abdusharipov Izzatbek) profili ko'nikma, tajriba va ta'lim ma'lumotlari bilan boyitildi.");
        });
    }

    private void seedOperationalLearningData() {
        log.info("Seeding operational learning data (Modules 08-11: Lessons, Assessments, Assignments, Grades)...");

        StudyGroup group8 = studyGroupRepository.findAll().stream()
                .filter(g -> "8-sinf".equalsIgnoreCase(g.getGradeLevel()) || g.getGroupCode().contains("YA-26I0804"))
                .findFirst()
                .orElse(null);

        Mentor mentor = mentorRepository.findAll().stream().findFirst().orElse(null);
        if (group8 == null || mentor == null) {
            log.warn("Cannot seed operational learning data: Group or Mentor not found.");
            return;
        }

        AcademicPeriod period = academicPeriodRepository.findAll().stream().findFirst().orElse(null);
        List<Student> students = studentRepository.findByGroupId(group8.getId());
        if (students.isEmpty()) {
            students = studentRepository.findAll();
        }

        // 1. Lessons
        Lesson lesson1 = lessonRepository.save(Lesson.builder()
                .title("Kompyuter arxitekturasi va apparat ta'minoti")
                .subject("Web Full-Stack Development")
                .gradeLevel("8-sinf")
                .topic("Fon Neyman arxitekturasi va zamonaviy CPU tuzilishi")
                .learningObjectives("Kompyuterning asosiy funksional qismlari, protsessor, xotira va ma'lumot shinasining o'zaro aloqasini tushunish.")
                .expectedOutcomes("O'quvchilar buyruqlar sikli (fetch-decode-execute) hamda registrlar va kesh iyerarxiyasini tushuntirib bera oladi.")
                .requiredMaterials("Protsessor sxemasi, mantiqiy elementlar simulyatori, slaydar.")
                .theoryContent("Fon Neyman arxitekturasining 4 ta asosiy tamoyili: xotira bir xilligi, manzillanuvchanlik, ketma-ket ijro va dasturiy boshqaruv.")
                .theoryDurationMinutes(20)
                .practicalContent("Simulyatorda oddiy assambler buyruqlari yordamida registrlarda qo'shish va ko'paytirish amallarini kuzatish.")
                .practicalDurationMinutes(25)
                .exercises("1. ALU va CU o'rtasidagi farqni yozing.\n2. 32-bit va 64-bit registrlar o'tkazuvchanligini solishtiring.")
                .homework("O'z shaxsiy kompyuteringiz yoki smartfoningizning apparat konfiguratsiyasini jadvalga tushiring.")
                .durationMinutes(80)
                .groupId(group8.getId())
                .mentorId(mentor.getId())
                .status("PUBLISHED")
                .build());

        Lesson lesson2 = lessonRepository.save(Lesson.builder()
                .title("HTML5 Semantik teglari va formalar")
                .subject("Web Full-Stack Development")
                .gradeLevel("8-sinf")
                .topic("Header, nav, main, section, footer va form elementlari")
                .theoryContent("Veb sahifaning semantik tuzilishi va qulay foydalanish (accessibility) tamoyillari.")
                .theoryDurationMinutes(20)
                .practicalContent("O'quv markazi uchun semantik ro'yxatdan o'tish formasini yaratish.")
                .practicalDurationMinutes(25)
                .exercises("Formada talab qilinadigan validatsiya qoidalarini yozing.")
                .homework("Shaxsiy veb-sayt uchun bosh sahifa semantik maketini tuzish.")
                .durationMinutes(80)
                .groupId(group8.getId())
                .mentorId(mentor.getId())
                .status("PUBLISHED")
                .build());

        Lesson lesson3 = lessonRepository.save(Lesson.builder()
                .title("CSS Flexbox bilan zamonaviy moslashuvchan maketlash")
                .subject("Web Full-Stack Development")
                .gradeLevel("8-sinf")
                .topic("Flex container, direction, justify-content, align-items")
                .theoryContent("Flexbox yordamida bir o'lchovli elementlarni boshqarish.")
                .theoryDurationMinutes(20)
                .practicalContent("Navigatsiya paneli va mahsulot kartalarini joylashtirish.")
                .practicalDurationMinutes(25)
                .durationMinutes(80)
                .groupId(group8.getId())
                .mentorId(mentor.getId())
                .status("PUBLISHED")
                .build());

        // 2. Student Lesson Progress
        for (Student s : students) {
            studentLessonProgressRepository.save(StudentLessonProgress.builder()
                    .lessonId(lesson1.getId())
                    .studentId(s.getId())
                    .status("COMPLETED")
                    .score(90)
                    .mentorFeedback("Nazariy va amaliy topshiriqlarni to'liq bajardi.")
                    .build());

            studentLessonProgressRepository.save(StudentLessonProgress.builder()
                    .lessonId(lesson2.getId())
                    .studentId(s.getId())
                    .status("COMPLETED")
                    .score(88)
                    .mentorFeedback("Semantik teglar to'g'ri ishlatilgan.")
                    .build());
        }

        // 3. Assessment
        Assessment quiz = assessmentRepository.save(Assessment.builder()
                .title("Kompyuter arxitekturasi va apparat ta'minoti oraliq nazorati")
                .description("8-sinf o'quvchilari uchun Von Neumann arxitekturasi, CPU va xotira bo'yicha oraliq test.")
                .subject("Web Full-Stack Development")
                .gradeLevel("8-sinf")
                .topic("Kompyuter arxitekturasi")
                .assessmentType("QUIZ")
                .totalPoints(100)
                .passingScore(60)
                .durationMinutes(45)
                .maxAttempts(1)
                .isPublished(true)
                .groupId(group8.getId())
                .createdByMentorId(mentor.getId())
                .build());

        assessmentQuestionRepository.save(AssessmentQuestion.builder()
                .assessmentId(quiz.getId())
                .questionText("Fon Neyman arxitekturasida barcha hisoblash va mantiqiy amallarni bajaruvchi asosiy qism qaysi?")
                .questionType("MULTIPLE_CHOICE")
                .points(30)
                .orderIndex(1)
                .optionsJson("[\"A) Arifmetik-mantiqiy qurilma (ALU)\", \"B) Qattiq disk (HDD)\", \"C) Tizim shinalari\", \"D) Kiritish qurilmalari\"]")
                .correctAnswersJson("[\"A) Arifmetik-mantiqiy qurilma (ALU)\"]")
                .explanation("ALU (Arithmetic Logic Unit) protsessor tarkibida bo'lib, matematik va mantiqiy amallarni bajaradi.")
                .build());

        assessmentQuestionRepository.save(AssessmentQuestion.builder()
                .assessmentId(quiz.getId())
                .questionText("Tezkor xotira (RAM) qanday asosiy xususiyatga ega?")
                .questionType("MULTIPLE_CHOICE")
                .points(35)
                .orderIndex(2)
                .optionsJson("[\"A) Elektr ta'minoti uzilganda ma'lumotlar o'chadi (volatillik)\", \"B) Faqat o'qish uchun mo'ljallangan\", \"C) Eng sekin xotira turi\", \"D) Magnit disklarda saqlanadi\"]")
                .correctAnswersJson("[\"A) Elektr ta'minoti uzilganda ma'lumotlar o'chadi (volatillik)\"]")
                .explanation("RAM operativ xotirasi elektr quvvati bor vaqtda ishlaydi va o'chganda tozalanadi.")
                .build());

        assessmentQuestionRepository.save(AssessmentQuestion.builder()
                .assessmentId(quiz.getId())
                .questionText("Buyruqlar siklining (Instruction Cycle) to'g'ri ketma-ketligi qaysi?")
                .questionType("MULTIPLE_CHOICE")
                .points(35)
                .orderIndex(3)
                .optionsJson("[\"A) Fetch (qabul qilish) -> Decode (dekodlash) -> Execute (bajarish)\", \"B) Execute -> Fetch -> Store\", \"C) Decode -> Execute -> Print\", \"D) Compile -> Link -> Run\"]")
                .correctAnswersJson("[\"A) Fetch (qabul qilish) -> Decode (dekodlash) -> Execute (bajarish)\"]")
                .explanation("Protsessor avval xotiradan buyruqni oladi (Fetch), uni tushunadi (Decode) va so'ngra ijro etadi (Execute).")
                .build());

        // Assessment Attempts
        int[] scores = {95, 90, 88, 82, 78, 85, 74, 92, 86};
        int sIdx = 0;
        for (Student s : students) {
            int score = scores[sIdx % scores.length];
            studentAssessmentAttemptRepository.save(StudentAssessmentAttempt.builder()
                    .assessmentId(quiz.getId())
                    .studentId(s.getId())
                    .attemptNumber(1)
                    .startedAt(LocalDateTime.now().minusDays(3))
                    .submittedAt(LocalDateTime.now().minusDays(3).plusMinutes(28))
                    .timeSpentSeconds(1680)
                    .totalScore(score)
                    .maxPossibleScore(100)
                    .percentage((double) score)
                    .status("EVALUATED")
                    .mentorFeedback("Yaxshi tahliliy bilim namoyon qilindi.")
                    .gradedByMentorId(mentor.getId())
                    .gradedAt(LocalDateTime.now().minusDays(3).plusMinutes(35))
                    .build());

            // Grade Records
            gradeRecordRepository.save(GradeRecord.builder()
                    .studentId(s.getId())
                    .subject("Web Full-Stack Development")
                    .gradeLevel("8-sinf")
                    .academicPeriodId(period != null ? period.getId() : null)
                    .evaluationType("QUIZ")
                    .score(score)
                    .maxScore(100)
                    .letterGrade(score >= 90 ? "A" : (score >= 80 ? "B" : (score >= 70 ? "C" : "D")))
                    .isPassing(score >= 60)
                    .comments("Oraliq test natijasi")
                    .mentorId(mentor.getId())
                    .build());

            sIdx++;
        }

        // 4. Assignment & Submissions
        Assignment assignment = assignmentRepository.save(Assignment.builder()
                .title("HTML & CSS: Shaxsiy portfolio veb-saytini tuzish")
                .description("Semantik teglar va Flexbox yordamida o'z portfoliosini yaratish hamda GitHub repository havolasini yuborish.")
                .subject("Web Full-Stack Development")
                .gradeLevel("8-sinf")
                .groupId(group8.getId())
                .mentorId(mentor.getId())
                .deadline(LocalDateTime.now().plusDays(6))
                .maxPoints(100)
                .isActive(true)
                .build());

        int aIdx = 0;
        for (Student s : students) {
            int aScore = (aIdx % 3 == 0) ? 95 : ((aIdx % 3 == 1) ? 88 : 82);
            assignmentSubmissionRepository.save(AssignmentSubmission.builder()
                    .assignmentId(assignment.getId())
                    .studentId(s.getId())
                    .submissionText("GitHub repository: https://github.com/student-" + s.getId() + "/portfolio")
                    .submittedAt(LocalDateTime.now().minusDays(2))
                    .status("GRADED")
                    .score(aScore)
                    .feedback("Kodni strukturalash va dizayn talabga javob beradi.")
                    .gradedByMentorId(mentor.getId())
                    .gradedAt(LocalDateTime.now().minusDays(1))
                    .build());
            aIdx++;
        }

        // 5. Past Lesson Sessions with attendance for trend analysis
        LocalDate pastWeek1 = LocalDate.now().minusWeeks(1);
        LessonSession pastSession1 = lessonSessionRepository.save(LessonSession.builder()
                .group(group8)
                .mentor(mentor)
                .room("IT Lab 1")
                .subject("Web Full-Stack Development")
                .topic("Kompyuter arxitekturasi va apparat ta'minoti")
                .lessonDate(pastWeek1)
                .startTime("15:00")
                .endTime("16:30")
                .status("COMPLETED")
                .build());

        for (Student s : students) {
            attendanceRecordRepository.save(AttendanceRecord.builder()
                    .lessonSession(pastSession1)
                    .student(s)
                    .status(s.getId() % 5 == 0 ? "EXCUSED" : (s.getId() % 6 == 0 ? "LATE" : "PRESENT"))
                    .recordedBy("admin")
                    .recordedAt(pastWeek1.atTime(16, 30))
                    .notes(s.getId() % 5 == 0 ? "Kasal bo'lganligi sababli ma'lumotnoma berilgan" : null)
                    .build());
        }

        LocalDate pastWeek2 = LocalDate.now().minusWeeks(2);
        LessonSession pastSession2 = lessonSessionRepository.save(LessonSession.builder()
                .group(group8)
                .mentor(mentor)
                .room("IT Lab 1")
                .subject("Web Full-Stack Development")
                .topic("HTML5 Semantik teglari va formalar")
                .lessonDate(pastWeek2)
                .startTime("15:00")
                .endTime("16:30")
                .status("COMPLETED")
                .build());

        for (Student s : students) {
            attendanceRecordRepository.save(AttendanceRecord.builder()
                    .lessonSession(pastSession2)
                    .student(s)
                    .status(s.getId() % 7 == 0 ? "ABSENT" : "PRESENT")
                    .recordedBy("admin")
                    .recordedAt(pastWeek2.atTime(16, 30))
                    .build());
        }

        log.info("Operational learning data seeding complete!");
    }

    private void seedRbacSystem() {
        // Permissions catalog
        Map<String, String> perms = new LinkedHashMap<>();
        // User & Role
        perms.put("users.read", "User Management: Foydalanuvchilar ro'yxatini ko'rish");
        perms.put("users.create", "User Management: Yangi foydalanuvchi yaratish");
        perms.put("users.update", "User Management: Foydalanuvchilarni tahrirlash");
        perms.put("users.disable", "User Management: Hisobni to'xtatish (suspend)");
        perms.put("roles.read", "RBAC: Rollar va ruxsatlarni ko'rish");
        perms.put("roles.assign", "RBAC: Rollarni foydalanuvchilarga biriktirish");
        perms.put("roles.manage", "RBAC: Rollar va ruxsatlar matritsasini tahrirlash");
        // Lessons & Scheduling
        perms.put("lessons.read", "Scheduling: Dars mashg'ulotlari va jadvalni ko'rish");
        perms.put("lessons.create", "Scheduling: Dars mashg'ulotini rejalashtirish");
        perms.put("lessons.update", "Scheduling: Darsni ko'chirish yoki tahrirlash");
        perms.put("lessons.delete", "Scheduling: Darsni bekor qilish yoki o'chirish");
        perms.put("lessons.publish", "Scheduling: Dars jadvalini e'lon qilish");
        // Attendance
        perms.put("attendance.read", "Attendance: Davomatni ko'rish");
        perms.put("attendance.record", "Attendance: Davomatni qayd etish");
        perms.put("attendance.edit", "Attendance: Davomatga tuzatish kiritish");
        // Assessments & Grading
        perms.put("assessments.read", "Assessments: Baholash mezonlari va topshiriqlarni ko'rish");
        perms.put("assessments.create", "Assessments: Baholash mezonlarini yaratish");
        perms.put("assessments.grade", "Assessments: Baholash va natijalarni kiritish");
        // Reports & Analytics
        perms.put("reports.read", "Reports: Hisobotlarni ko'rish");
        perms.put("reports.export", "Reports: Hisobotlarni PDF/Excel yuklab olish");
        perms.put("analytics.read", "Analytics: Platforma tahliliy ko'rsatkichlarini ko'rish");
        // Groups & Mentors & Materials & Curriculum
        perms.put("curriculum.read", "Curriculum: O'quv rejasini ko'rish");
        perms.put("curriculum.manage", "Curriculum: O'quv rejalarini boshqarish");
        perms.put("materials.read", "Materials: O'quv materiallarini ko'rish");
        perms.put("materials.manage", "Materials: O'quv materiallarini boshqarish");
        perms.put("groups.read", "Groups: Guruhlar va ta'lim tuzilmasini ko'rish");
        perms.put("groups.manage", "Groups: Guruhlar va ta'lim tuzilmasini boshqarish");
        perms.put("mentors.read", "Mentors: Mentor profillarini ko'rish");
        perms.put("mentors.manage", "Mentors: Mentor profillarini tasdiqlash va boshqarish");
        // System & Audit
        perms.put("audit.read", "Audit: Tizim audit jurnallarini ko'rish va eksport qilish");
        perms.put("system.configure", "System: Tizim sozlamalarini konfiguratsiya qilish");

        Map<String, Permission> savedPerms = new HashMap<>();
        for (Map.Entry<String, String> entry : perms.entrySet()) {
            String name = entry.getKey();
            String desc = entry.getValue();
            String category = name.split("\\.")[0].toUpperCase();

            Permission p = permissionRepository.findByName(name)
                    .orElseGet(() -> permissionRepository.save(Permission.builder()
                            .name(name)
                            .category(category)
                            .description(desc)
                            .build()));
            savedPerms.put(name, p);
        }

        // Roles catalog
        createRoleIfMissing("SUPER_ADMIN", "Tizimning to'liq cheklovlarsiz boshqaruvchisi", true, new HashSet<>(savedPerms.values()));
        createRoleIfMissing("ADMIN", "Tizim ma'muri (Legacy moslik)", true, new HashSet<>(savedPerms.values()));
        createRoleIfMissing("PROGRAM_ADMIN", "Ta'lim dasturi va jarayonlari koordinatori", true,
                getPermSet(savedPerms, "users.read", "users.create", "users.update", "roles.read", "lessons.read", "lessons.create", "lessons.update", "lessons.publish", "attendance.read", "attendance.record", "attendance.edit", "assessments.read", "assessments.create", "assessments.grade", "reports.read", "reports.export", "analytics.read", "curriculum.read", "curriculum.manage", "materials.read", "materials.manage", "groups.read", "groups.manage", "mentors.read", "mentors.manage"));
        createRoleIfMissing("REGIONAL_COORDINATOR", "Hududiy filial va ta'lim markazlari koordinatori", true,
                getPermSet(savedPerms, "users.read", "groups.read", "groups.manage", "reports.read", "reports.export", "analytics.read", "lessons.read", "lessons.create", "lessons.update", "attendance.read"));
        createRoleIfMissing("COORDINATOR", "Koordinator (Legacy moslik)", true,
                getPermSet(savedPerms, "users.read", "groups.read", "groups.manage", "reports.read", "reports.export", "analytics.read", "lessons.read", "lessons.create", "lessons.update", "attendance.read"));
        createRoleIfMissing("MENTOR", "IT va fan mentori, dars va davomat o'tkazuvchi", true,
                getPermSet(savedPerms, "lessons.read", "lessons.create", "lessons.update", "attendance.read", "attendance.record", "attendance.edit", "assessments.read", "assessments.create", "assessments.grade", "materials.read", "materials.manage", "curriculum.read", "reports.read"));
        createRoleIfMissing("ENGLISH_MENTOR", "Ingliz tili fani mentori, dars va davomat o'tkazuvchi", true,
                getPermSet(savedPerms, "lessons.read", "lessons.create", "lessons.update", "attendance.read", "attendance.record", "attendance.edit", "assessments.read", "assessments.create", "assessments.grade", "materials.read", "materials.manage", "curriculum.read", "reports.read"));
        createRoleIfMissing("STUDENT", "Ta'lim oluvchi o'quvchi", true,
                getPermSet(savedPerms, "lessons.read", "materials.read", "curriculum.read", "assessments.read", "reports.read"));
        createRoleIfMissing("CONTENT_MANAGER", "O'quv rejalari va materiallar muharriri", true,
                getPermSet(savedPerms, "materials.read", "materials.manage", "curriculum.read", "curriculum.manage", "lessons.read", "lessons.create", "lessons.update", "lessons.publish"));
        createRoleIfMissing("OBSERVER", "Kuzatuvchi va tahlilchi", true,
                getPermSet(savedPerms, "reports.read", "analytics.read", "users.read", "roles.read", "lessons.read", "curriculum.read", "materials.read"));
    }

    private Set<Permission> getPermSet(Map<String, Permission> map, String... names) {
        Set<Permission> set = new HashSet<>();
        for (String n : names) {
            if (map.containsKey(n)) set.add(map.get(n));
        }
        return set;
    }

    private void createRoleIfMissing(String name, String description, boolean isSystem, Set<Permission> permissions) {
        Role role = roleRepository.findByName(name).orElse(null);
        if (role == null) {
            roleRepository.save(Role.builder()
                    .name(name)
                    .description(description)
                    .isSystem(isSystem)
                    .permissions(permissions)
                    .build());
        } else if (role.getPermissions() == null || role.getPermissions().isEmpty()) {
            role.setPermissions(permissions);
            roleRepository.save(role);
        }
    }

    private void seedDefaultAdmin() {
        Role superAdminRole = roleRepository.findByName("SUPER_ADMIN").orElse(null);
        Role mentorRole = roleRepository.findByName("MENTOR").orElse(null);
        Role studentRole = roleRepository.findByName("STUDENT").orElse(null);

        // 1. Admin
        User admin = userRepository.findByUsername("admin").orElse(null);
        if (admin == null) {
            Set<Role> roles = new HashSet<>();
            if (superAdminRole != null) roles.add(superAdminRole);

            userRepository.save(User.builder()
                    .username("admin")
                    .password(passwordEncoder.encode("admin123"))
                    .fullName("Tizim Administratori")
                    .email("admin@axm-nexus.uz")
                    .phone("+998 90 000 00 00")
                    .role("ROLE_SUPER_ADMIN")
                    .roles(roles)
                    .enabled(true)
                    .emailVerified(true)
                    .build());
            log.info("Default admin user created with SUPER_ADMIN role: admin / admin123");
        } else if (superAdminRole != null && (admin.getRoles() == null || admin.getRoles().isEmpty())) {
            admin.getRoles().add(superAdminRole);
            admin.setRole("ROLE_SUPER_ADMIN");
            userRepository.save(admin);
        }

        // Clean up legacy mock data accounts (mentor/student) if present
        userRepository.findByUsername("mentor").ifPresent(userRepository::delete);
        userRepository.findByUsername("student").ifPresent(userRepository::delete);
        userRepository.findByEmailIgnoreCase("mentor@axm-nexus.uz").ifPresent(userRepository::delete);
        userRepository.findByEmailIgnoreCase("student@axm-nexus.uz").ifPresent(userRepository::delete);

        // 2. Real Mentor accounts with HEMIS ID (e.g. 32600001, 32600002)
        Set<Role> mentorRoles = new HashSet<>();
        if (mentorRole != null) mentorRoles.add(mentorRole);

        User mentor1 = userRepository.findByUsername("32600001")
                .or(() -> userRepository.findByEmailIgnoreCase("abdusharipovizzat03@gmail.com"))
                .orElse(null);

        if (mentor1 == null) {
            userRepository.save(User.builder()
                    .username("32600001")
                    .password(passwordEncoder.encode("AxmMentor2026!"))
                    .fullName("Abdusharipov Izzatbek quranboy o'g'li")
                    .email("abdusharipovizzat03@gmail.com")
                    .phone("+998 90 123 45 67")
                    .role("ROLE_MENTOR")
                    .roles(mentorRoles)
                    .enabled(true)
                    .emailVerified(true)
                    .build());
            log.info("Real Mentor user created with HEMIS ID: 32600001 / AxmMentor2026!");
        } else {
            mentor1.setUsername("32600001");
            mentor1.setEmail("abdusharipovizzat03@gmail.com");
            mentor1.setPassword(passwordEncoder.encode("AxmMentor2026!"));
            mentor1.setFullName("Abdusharipov Izzatbek quranboy o'g'li");
            mentor1.setRole("ROLE_MENTOR");
            mentor1.setRoles(mentorRoles);
            mentor1.setEnabled(true);
            mentor1.setEmailVerified(true);
            userRepository.save(mentor1);
            log.info("Existing Mentor user updated to HEMIS ID: 32600001");
        }

        User mentor2 = userRepository.findByUsername("32600002")
                .or(() -> userRepository.findByEmailIgnoreCase("dilnoza.eng@gmail.com"))
                .orElse(null);

        if (mentor2 == null) {
            userRepository.save(User.builder()
                    .username("32600002")
                    .password(passwordEncoder.encode("AxmEnglish2026!"))
                    .fullName("Raximova Dilnoza Sanjarbek qizi")
                    .email("dilnoza.eng@gmail.com")
                    .phone("+998 91 987 65 43")
                    .role("ROLE_ENGLISH_MENTOR")
                    .roles(mentorRoles)
                    .enabled(true)
                    .emailVerified(true)
                    .build());
            log.info("Real English Mentor user created with HEMIS ID: 32600002 / AxmEnglish2026!");
        } else {
            mentor2.setUsername("32600002");
            mentor2.setEmail("dilnoza.eng@gmail.com");
            mentor2.setPassword(passwordEncoder.encode("AxmEnglish2026!"));
            mentor2.setFullName("Raximova Dilnoza Sanjarbek qizi");
            mentor2.setRole("ROLE_ENGLISH_MENTOR");
            mentor2.setRoles(mentorRoles);
            mentor2.setEnabled(true);
            mentor2.setEmailVerified(true);
            userRepository.save(mentor2);
            log.info("Existing English Mentor user updated to HEMIS ID: 32600002");
        }

        // 3. Real Student accounts with HEMIS ID (42600001+)
        List<Student> allStudents = studentRepository.findAll();
        int seq = 1;
        for (Student s : allStudents) {
            String studentHemisId = String.format("426%05d", seq);
            if (s.getStudentIdNumber() == null || s.getStudentIdNumber().startsWith("I-HR")) {
                s.setStudentIdNumber(studentHemisId);
                studentRepository.save(s);
            } else {
                studentHemisId = s.getStudentIdNumber();
            }

            final String hemisIdToSearch = studentHemisId;
            User studentUser = userRepository.findByUsername(hemisIdToSearch)
                    .or(() -> userRepository.findByEmailIgnoreCase(hemisIdToSearch + "@student.axm-nexus.uz"))
                    .orElse(null);

            Set<Role> roles = new HashSet<>();
            if (studentRole != null) roles.add(studentRole);

            if (studentUser == null) {
                userRepository.save(User.builder()
                        .username(hemisIdToSearch)
                        .password(passwordEncoder.encode("Student2026!"))
                        .fullName(s.getFullName())
                        .phone(s.getPhone())
                        .email(hemisIdToSearch + "@student.axm-nexus.uz")
                        .role("ROLE_STUDENT")
                        .roles(roles)
                        .enabled(true)
                        .emailVerified(true)
                        .build());
            } else {
                studentUser.setUsername(hemisIdToSearch);
                studentUser.setFullName(s.getFullName());
                studentUser.setRoles(roles);
                studentUser.setEnabled(true);
                studentUser.setEmailVerified(true);
                userRepository.save(studentUser);
            }
            seq++;
        }
    }

    private void seedModule14To16Data() {
        User admin = userRepository.findByUsername("admin").orElse(null);
        if (admin == null) return;

        // 1. Foydalanuvchi sozlamalari (Modul 15)
        if (userPreferenceRepository.findByUserId(admin.getId()).isEmpty()) {
            userPreferenceRepository.save(uz.axm.nexus.users.domain.UserPreference.builder()
                    .userId(admin.getId())
                    .locale("uz")
                    .theme("system")
                    .reducedMotion(false)
                    .dateFormat("YYYY-MM-DD")
                    .build());
        }

        // 2. Bildirishnoma sozlamalari (Modul 14)
        if (notificationPreferenceRepository.findByUserId(admin.getId()).isEmpty()) {
            notificationPreferenceRepository.save(uz.axm.nexus.notifications.domain.NotificationPreference.builder()
                    .userId(admin.getId())
                    .inAppEnabled(true)
                    .emailEnabled(true)
                    .lessonAlerts(true)
                    .assignmentAlerts(true)
                    .assessmentAlerts(true)
                    .announcementAlerts(true)
                    .digestFrequency("INSTANT")
                    .build());
        }

        // 3. Namunaviy bildirishnomalar (Modul 14)
        if (notificationRepository.count() == 0) {
            notificationRepository.save(uz.axm.nexus.notifications.domain.Notification.builder()
                    .recipientUserId(admin.getId())
                    .title("AXM Nexus v2.0 tizimiga xush kelibsiz!")
                    .message("Muhammad Al-Xorazmiy Vorislari ta'lim ekotizimi boshqaruv markaziga muvaffaqiyatli ulandingiz.")
                    .type(uz.axm.nexus.notifications.domain.NotificationType.ADMIN_ANNOUNCEMENT.name())
                    .read(false)
                    .actionUrl("/dashboard")
                    .deduplicationKey("WELCOME_SYSTEM_" + admin.getId())
                    .build());

            notificationRepository.save(uz.axm.nexus.notifications.domain.Notification.builder()
                    .recipientUserId(admin.getId())
                    .title("Yangi dars rejasi tasdiqlandi")
                    .message("9-sinf informatika fani bo'yicha «Algoritmlar murakkabligi» darsi tasdiqlash uchun tayyor.")
                    .type(uz.axm.nexus.notifications.domain.NotificationType.LESSON_PUBLISHED.name())
                    .read(false)
                    .actionUrl("/lessons")
                    .deduplicationKey("LESSON_PUB_SAMPLE_" + admin.getId())
                    .build());

            notificationRepository.save(uz.axm.nexus.notifications.domain.Notification.builder()
                    .recipientUserId(admin.getId())
                    .title("Topshiriq muddati yaqinlashmoqda")
                    .message("Guruh 9-A o'quvchilari uchun Python dasturlash amaliy topshirig'i topshirish muddati: bugun 23:59.")
                    .type(uz.axm.nexus.notifications.domain.NotificationType.ASSIGNMENT_DEADLINE.name())
                    .read(true)
                    .readAt(LocalDateTime.now().minusHours(3))
                    .actionUrl("/assessments")
                    .deduplicationKey("ASSIGN_DEADLINE_SAMPLE_" + admin.getId())
                    .build());
        }

        // 4. Namunaviy audit yozuvlari (Modul 16)
        if (auditLogRepository.count() == 0) {
            auditLogRepository.save(uz.axm.nexus.audit.domain.AuditLog.builder()
                    .action("ROLE_ASSIGN")
                    .entityName("User")
                    .entityId(String.valueOf(admin.getId()))
                    .performedBy("SYSTEM")
                    .outcome("SUCCESS")
                    .ipAddress("127.0.0.1")
                    .details("Admin foydalanuvchisiga SUPER_ADMIN roli biriktirildi")
                    .metadata("{\"role\":\"ROLE_SUPER_ADMIN\"}")
                    .build());

            auditLogRepository.save(uz.axm.nexus.audit.domain.AuditLog.builder()
                    .action("CONFIG_UPDATE")
                    .entityName("SystemConfig")
                    .entityId("platform.registration_open")
                    .performedBy("admin")
                    .outcome("SUCCESS")
                    .ipAddress("127.0.0.1")
                    .details("Foydalanuvchilar ochiq ro'yxatdan o'tishi parametrlari tasdiqlandi")
                    .metadata("{\"value\":\"true\"}")
                    .build());
        }

        // 5. Tizim konfiguratsiyalari (Modul 16)
        if (systemConfigRepository.count() == 0) {
            systemConfigRepository.save(uz.axm.nexus.audit.domain.SystemConfig.builder()
                    .configKey("platform.maintenance_mode")
                    .configValue("false")
                    .category("GENERAL")
                    .secret(false)
                    .description("Tizimda profilaktika rejimi yoqilganligi")
                    .updatedBy("SYSTEM")
                    .build());

            systemConfigRepository.save(uz.axm.nexus.audit.domain.SystemConfig.builder()
                    .configKey("features.ai_assistant")
                    .configValue("true")
                    .category("FEATURES")
                    .secret(false)
                    .description("AI Teaching Assistant moduli faolligi")
                    .updatedBy("SYSTEM")
                    .build());

            systemConfigRepository.save(uz.axm.nexus.audit.domain.SystemConfig.builder()
                    .configKey("features.email_notifications")
                    .configValue("true")
                    .category("NOTIFICATIONS")
                    .secret(false)
                    .description("Email bildirishnomalar yuborish holati")
                    .updatedBy("SYSTEM")
                    .build());

            systemConfigRepository.save(uz.axm.nexus.audit.domain.SystemConfig.builder()
                    .configKey("enrollment.max_group_capacity")
                    .configValue("24")
                    .category("GENERAL")
                    .secret(false)
                    .description("O'quv guruhidagi maksimal o'quvchilar soni")
                    .updatedBy("SYSTEM")
                    .build());
        }
    }
}
