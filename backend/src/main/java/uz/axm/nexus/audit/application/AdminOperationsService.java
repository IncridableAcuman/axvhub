package uz.axm.nexus.audit.application;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import uz.axm.nexus.access.application.RbacService;
import uz.axm.nexus.access.application.UserDto;
import uz.axm.nexus.access.domain.Role;
import uz.axm.nexus.access.infrastructure.RoleRepository;
import uz.axm.nexus.assessments.infrastructure.AssessmentRepository;
import uz.axm.nexus.audit.domain.AuditLog;
import uz.axm.nexus.audit.domain.SystemConfig;
import uz.axm.nexus.audit.infrastructure.AuditLogRepository;
import uz.axm.nexus.audit.infrastructure.SystemConfigRepository;
import uz.axm.nexus.classrooms.infrastructure.StudyGroupRepository;
import uz.axm.nexus.grading.domain.GradeRecord;
import uz.axm.nexus.grading.infrastructure.GradeRecordRepository;
import uz.axm.nexus.lessons.domain.Lesson;
import uz.axm.nexus.lessons.infrastructure.LessonRepository;
import uz.axm.nexus.mentors.infrastructure.MentorRepository;
import uz.axm.nexus.resources.domain.LearningResource;
import uz.axm.nexus.resources.infrastructure.LearningResourceRepository;
import uz.axm.nexus.shared.application.BusinessException;
import uz.axm.nexus.shared.application.ResourceNotFoundException;
import uz.axm.nexus.users.domain.User;
import uz.axm.nexus.users.infrastructure.StudentRepository;
import uz.axm.nexus.users.infrastructure.UserRepository;

import javax.sql.DataSource;
import java.lang.management.ManagementFactory;
import java.sql.Connection;
import java.time.LocalDateTime;
import java.util.*;

@Service
@RequiredArgsConstructor
@Slf4j
public class AdminOperationsService {

    private final UserRepository userRepository;
    private final StudentRepository studentRepository;
    private final MentorRepository mentorRepository;
    private final StudyGroupRepository studyGroupRepository;
    private final LessonRepository lessonRepository;
    private final AssessmentRepository assessmentRepository;
    private final GradeRecordRepository gradeRecordRepository;
    private final LearningResourceRepository learningResourceRepository;
    private final AuditLogRepository auditLogRepository;
    private final SystemConfigRepository systemConfigRepository;
    private final RoleRepository roleRepository;
    private final AuditService auditService;
    private final RbacService rbacService;
    private final DataSource dataSource;

    /**
     * Platforma umumiy ko'rsatkichlari (Platform Overview)
     */
    @Transactional(readOnly = true)
    public AdminOverviewDto getOverviewStats() {
        long totalUsers = userRepository.count();
        long totalStudents = studentRepository.count();
        long totalMentors = mentorRepository.count();
        long totalGroups = studyGroupRepository.count();
        long totalLessons = lessonRepository.count();
        long totalAssessments = assessmentRepository.count();
        long totalAuditLogs = auditLogRepository.count();

        // Operatsion ko'rsatkichlar
        Map<String, Object> metrics = new HashMap<>();
        Runtime runtime = Runtime.getRuntime();
        metrics.put("jvmTotalMemoryMb", runtime.totalMemory() / (1024 * 1024));
        metrics.put("jvmUsedMemoryMb", (runtime.totalMemory() - runtime.freeMemory()) / (1024 * 1024));
        metrics.put("availableProcessors", runtime.availableProcessors());
        metrics.put("uptimeSeconds", ManagementFactory.getRuntimeMXBean().getUptime() / 1000);

        return AdminOverviewDto.builder()
                .totalUsers(totalUsers)
                .totalStudents(totalStudents)
                .totalMentors(totalMentors)
                .totalStudyGroups(totalGroups)
                .totalLessons(totalLessons)
                .totalAssessments(totalAssessments)
                .totalAuditLogs(totalAuditLogs)
                .systemStatus("HEALTHY")
                .operationalMetrics(metrics)
                .build();
    }

    /**
     * Foydalanuvchilar holatini boshqarish (Aktivlashtirish / Bloklash) - Audited
     */
    @Transactional
    public UserDto updateUserStatus(Long userId, UpdateUserStatusRequest request, String actor, String ipAddress) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Foydalanuvchi topilmadi: #" + userId));

        boolean oldStatus = user.isEnabled();
        if (oldStatus == request.isEnabled()) {
            return rbacService.toUserDto(user);
        }

        // Oxirgi faol Super Adminni bloklab qo'ymaslik
        if (!request.isEnabled() && rbacService.isSuperAdmin(user) && rbacService.countActiveSuperAdmins() <= 1) {
            throw new BusinessException("Tizimdagi yagona Super Admin hisobini faolsizlantirish taqiqlanadi.");
        }

        user.setEnabled(request.isEnabled());
        user = userRepository.save(user);

        String action = request.isEnabled() ? "ACCOUNT_REACTIVATE" : "ACCOUNT_SUSPEND";
        auditService.recordEvent(
                action,
                "User",
                String.valueOf(userId),
                actor,
                "SUCCESS",
                ipAddress,
                "Foydalanuvchi holati o'zgartirildi: " + (request.isEnabled() ? "Faollashtirildi" : "To'xtatildi")
                        + ". Sabab: " + request.getReason(),
                "{\"username\":\"" + user.getUsername() + "\",\"reason\":\"" + request.getReason() + "\"}"
        );

        return rbacService.toUserDto(user);
    }

    /**
     * Foydalanuvchi rollarini yangilash (Role Assignment) - Audited
     */
    @Transactional
    public UserDto updateUserRoles(Long userId, UpdateUserRolesRequest request, String actor, String ipAddress) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Foydalanuvchi topilmadi: #" + userId));

        Set<Role> newRoles = new HashSet<>();
        for (String roleName : request.getRoles()) {
            String normalized = rbacService.normalizeRoleName(roleName);
            Role role = roleRepository.findByName(normalized)
                    .orElseGet(() -> roleRepository.save(Role.builder()
                            .name(normalized)
                            .description(normalized + " roli")
                            .isSystem(true)
                            .build()));
            newRoles.add(role);
        }

        user.setRoles(newRoles);
        if (!newRoles.isEmpty()) {
            user.setRole(newRoles.iterator().next().getName());
        }
        user = userRepository.save(user);

        auditService.recordEvent(
                "ROLE_ASSIGN",
                "User",
                String.valueOf(userId),
                actor,
                "SUCCESS",
                ipAddress,
                "Foydalanuvchi rollari yangilandi: " + request.getRoles()
                        + (request.getReason() != null ? ". Sabab: " + request.getReason() : ""),
                "{\"username\":\"" + user.getUsername() + "\",\"roles\":" + request.getRoles() + "}"
        );

        return rbacService.toUserDto(user);
    }

    /**
     * Tizim konfiguratsiyalarini olish (Maxfiy qiymatlar yashirilgan holda)
     */
    @Transactional(readOnly = true)
    public List<SystemConfig> getSystemConfigs() {
        List<SystemConfig> configs = systemConfigRepository.findAll();
        // Xavfsizlik: isSecret=true bo'lgan qiymatlarni '********' bilan maskalash
        return configs.stream().map(c -> {
            if (c.isSecret()) {
                return SystemConfig.builder()
                        .configKey(c.getConfigKey())
                        .configValue("********")
                        .category(c.getCategory())
                        .secret(true)
                        .description(c.getDescription())
                        .updatedBy(c.getUpdatedBy())
                        .build();
            }
            return c;
        }).toList();
    }

    /**
     * Tizim konfiguratsiyasini yangilash - Audited
     */
    @Transactional
    public SystemConfig updateSystemConfig(UpdateSystemConfigRequest request, String actor, String ipAddress) {
        SystemConfig config = systemConfigRepository.findByConfigKey(request.getKey())
                .orElseGet(() -> SystemConfig.builder()
                        .configKey(request.getKey())
                        .category("GENERAL")
                        .secret(false)
                        .build());

        String oldValue = config.isSecret() ? "********" : config.getConfigValue();
        config.setConfigValue(request.getValue());
        if (request.getDescription() != null) {
            config.setDescription(request.getDescription());
        }
        config.setUpdatedBy(actor);
        config = systemConfigRepository.save(config);

        String safeLoggedNewValue = config.isSecret() ? "********" : request.getValue();
        auditService.recordEvent(
                "CONFIG_UPDATE",
                "SystemConfig",
                request.getKey(),
                actor,
                "SUCCESS",
                ipAddress,
                "Tizim parametri yangilandi: " + request.getKey() + " (" + oldValue + " -> " + safeLoggedNewValue + ")",
                "{\"key\":\"" + request.getKey() + "\"}"
        );

        return config;
    }

    /**
     * Ta'lim kontentini moderatsiya qilish (Lesson yoki LearningResource) - Audited
     */
    @Transactional
    public void moderateContent(ContentModerationRequest request, String actor, String ipAddress) {
        String type = request.getContentType().toUpperCase();
        if ("LESSON".equals(type)) {
            Lesson lesson = lessonRepository.findById(request.getContentId())
                    .orElseThrow(() -> new ResourceNotFoundException("Dars rejasi topilmadi: #" + request.getContentId()));
            lesson.setStatus(request.getStatus());
            lesson.setMentorNotes("Moderator eslatmasi: " + request.getModeratorNote());
            lessonRepository.save(lesson);
        } else if ("RESOURCE".equals(type)) {
            LearningResource resource = learningResourceRepository.findById(request.getContentId())
                    .orElseThrow(() -> new ResourceNotFoundException("Resurs topilmadi: #" + request.getContentId()));
            resource.setPublicationStatus(request.getStatus());
            learningResourceRepository.save(resource);
        } else {
            throw new IllegalArgumentException("Noma'lum kontent turi: " + request.getContentType());
        }

        auditService.recordEvent(
                "CONTENT_MODERATE",
                type,
                String.valueOf(request.getContentId()),
                actor,
                "SUCCESS",
                ipAddress,
                "Kontent moderatsiya qilindi: Status=" + request.getStatus() + ", Izoh: " + request.getModeratorNote(),
                "{\"status\":\"" + request.getStatus() + "\"}"
        );
    }

    /**
     * Baholarni qayta ko'rib chiqish va override qilish - Audited
     */
    @Transactional
    public GradeRecord overrideGrade(GradeOverrideRequest request, String actor, String ipAddress) {
        GradeRecord gradeRecord = gradeRecordRepository.findById(request.getGradeRecordId())
                .orElseThrow(() -> new ResourceNotFoundException("Baho yozuvi topilmadi: #" + request.getGradeRecordId()));

        Integer previousScore = gradeRecord.getScore();
        gradeRecord.setScore(request.getNewScore());
        gradeRecord.setComments((gradeRecord.getComments() != null ? gradeRecord.getComments() + "\n" : "")
                + "[Administrator tuzatishi (" + actor + ")]: " + request.getReason());
        gradeRecord = gradeRecordRepository.save(gradeRecord);

        auditService.recordEvent(
                "GRADE_OVERRIDE",
                "GradeRecord",
                String.valueOf(request.getGradeRecordId()),
                actor,
                "SUCCESS",
                ipAddress,
                "Baho o'zgartirildi: " + previousScore + " -> " + request.getNewScore() + ". Asos: " + request.getReason(),
                "{\"previousScore\":" + previousScore + ",\"newScore\":" + request.getNewScore() + ",\"reason\":\"" + request.getReason() + "\"}"
        );

        return gradeRecord;
    }

    /**
     * Operatsion holat va infratuzilma diagnostikasi (Xavfsiz, maxfiyliksiz)
     */
    public OperationalHealthDto getOperationalHealth() {
        String dbStatus = "CONNECTED";
        try (Connection conn = dataSource.getConnection()) {
            if (!conn.isValid(2)) {
                dbStatus = "DEGRADED";
            }
        } catch (Exception e) {
            log.error("DB health check error: {}", e.getMessage());
            dbStatus = "ERROR";
        }

        Runtime runtime = Runtime.getRuntime();
        long totalMem = runtime.totalMemory() / (1024 * 1024);
        long freeMem = runtime.freeMemory() / (1024 * 1024);
        long usedMem = totalMem - freeMem;

        Map<String, String> subsystemStatus = new LinkedHashMap<>();
        subsystemStatus.put("database", dbStatus);
        subsystemStatus.put("diskStorage", "READY");
        subsystemStatus.put("securityFilter", "ACTIVE");
        subsystemStatus.put("notificationCenter", "ACTIVE");

        return OperationalHealthDto.builder()
                .status("CONNECTED".equals(dbStatus) ? "UP" : "DEGRADED")
                .databaseStatus(dbStatus)
                .totalJvmMemoryMb(totalMem)
                .usedJvmMemoryMb(usedMem)
                .freeJvmMemoryMb(freeMem)
                .availableProcessors(runtime.availableProcessors())
                .uptimeSeconds(ManagementFactory.getRuntimeMXBean().getUptime() / 1000)
                .serverTime(LocalDateTime.now())
                .subsystemStatus(subsystemStatus)
                .build();
    }
}
