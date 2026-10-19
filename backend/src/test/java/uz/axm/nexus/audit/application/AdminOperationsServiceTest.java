package uz.axm.nexus.audit.application;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import uz.axm.nexus.access.application.RbacService;
import uz.axm.nexus.access.application.UserDto;
import uz.axm.nexus.access.domain.Role;
import uz.axm.nexus.access.infrastructure.RoleRepository;
import uz.axm.nexus.assessments.infrastructure.AssessmentRepository;
import uz.axm.nexus.audit.domain.AuditLog;
import uz.axm.nexus.audit.infrastructure.AuditLogRepository;
import uz.axm.nexus.audit.infrastructure.SystemConfigRepository;
import uz.axm.nexus.classrooms.infrastructure.StudyGroupRepository;
import uz.axm.nexus.grading.infrastructure.GradeRecordRepository;
import uz.axm.nexus.lessons.infrastructure.LessonRepository;
import uz.axm.nexus.mentors.infrastructure.MentorRepository;
import uz.axm.nexus.resources.infrastructure.LearningResourceRepository;
import uz.axm.nexus.shared.application.BusinessException;
import uz.axm.nexus.users.domain.User;
import uz.axm.nexus.users.infrastructure.StudentRepository;
import uz.axm.nexus.users.infrastructure.UserRepository;

import javax.sql.DataSource;
import java.sql.Connection;
import java.util.HashSet;
import java.util.List;
import java.util.Optional;
import java.util.Set;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AdminOperationsServiceTest {

    @Mock
    private UserRepository userRepository;
    @Mock
    private StudentRepository studentRepository;
    @Mock
    private MentorRepository mentorRepository;
    @Mock
    private StudyGroupRepository studyGroupRepository;
    @Mock
    private LessonRepository lessonRepository;
    @Mock
    private AssessmentRepository assessmentRepository;
    @Mock
    private GradeRecordRepository gradeRecordRepository;
    @Mock
    private LearningResourceRepository learningResourceRepository;
    @Mock
    private AuditLogRepository auditLogRepository;
    @Mock
    private SystemConfigRepository systemConfigRepository;
    @Mock
    private RoleRepository roleRepository;
    @Mock
    private AuditService auditService;
    @Mock
    private RbacService rbacService;
    @Mock
    private DataSource dataSource;

    @InjectMocks
    private AdminOperationsService adminOperationsService;

    private User sampleUser;

    @BeforeEach
    void setUp() {
        sampleUser = User.builder()
                .username("john_doe")
                .fullName("John Doe")
                .role("ROLE_STUDENT")
                .enabled(true)
                .roles(new HashSet<>())
                .build();
        sampleUser.setId(10L);
    }

    @Test
    @DisplayName("1. Foydalanuvchi hisobini to'xtatish (ACCOUNT_SUSPEND audit bilan)")
    void testUpdateUserStatus_SuspendWithAudit() {
        when(userRepository.findById(10L)).thenReturn(Optional.of(sampleUser));
        when(rbacService.isSuperAdmin(sampleUser)).thenReturn(false);
        when(userRepository.save(any(User.class))).thenAnswer(i -> i.getArgument(0));
        when(rbacService.toUserDto(any(User.class))).thenReturn(UserDto.builder().id(10L).enabled(false).build());

        UpdateUserStatusRequest request = UpdateUserStatusRequest.builder()
                .enabled(false)
                .reason("Qoidalarni buzganligi uchun")
                .build();

        UserDto result = adminOperationsService.updateUserStatus(10L, request, "super_admin", "192.168.1.1");

        assertThat(result.isEnabled()).isFalse();
        verify(auditService).recordEvent(
                eq("ACCOUNT_SUSPEND"),
                eq("User"),
                eq("10"),
                eq("super_admin"),
                eq("SUCCESS"),
                eq("192.168.1.1"),
                contains("Qoidalarni buzganligi uchun"),
                any()
        );
    }

    @Test
    @DisplayName("2. Yagona Super Adminni bloklash taqiqlanadi (Safeguard check)")
    void testUpdateUserStatus_SoleSuperAdminSafeguard() {
        when(userRepository.findById(10L)).thenReturn(Optional.of(sampleUser));
        when(rbacService.isSuperAdmin(sampleUser)).thenReturn(true);
        when(rbacService.countActiveSuperAdmins()).thenReturn(1L);

        UpdateUserStatusRequest request = UpdateUserStatusRequest.builder()
                .enabled(false)
                .reason("Test blok")
                .build();

        assertThatThrownBy(() -> adminOperationsService.updateUserStatus(10L, request, "super_admin", "127.0.0.1"))
                .isInstanceOf(BusinessException.class)
                .hasMessageContaining("yagona Super Admin hisobini faolsizlantirish taqiqlanadi");

        verify(userRepository, never()).save(any(User.class));
        verify(auditService, never()).recordEvent(any(), any(), any(), any(), any(), any(), any(), any());
    }

    @Test
    @DisplayName("3. Foydalanuvchi rollarini boshqarish (ROLE_ASSIGN audit bilan)")
    void testUpdateUserRoles_WithAudit() {
        when(userRepository.findById(10L)).thenReturn(Optional.of(sampleUser));
        when(rbacService.normalizeRoleName("MENTOR")).thenReturn("ROLE_MENTOR");
        when(roleRepository.findByName("ROLE_MENTOR")).thenReturn(Optional.of(Role.builder().name("ROLE_MENTOR").build()));
        when(userRepository.save(any(User.class))).thenAnswer(i -> i.getArgument(0));
        when(rbacService.toUserDto(any(User.class))).thenReturn(UserDto.builder().id(10L).build());

        UpdateUserRolesRequest request = UpdateUserRolesRequest.builder()
                .roles(Set.of("MENTOR"))
                .reason("Mentor lavozimiga tayinlandi")
                .build();

        adminOperationsService.updateUserRoles(10L, request, "admin_user", "10.0.0.1");

        verify(auditService).recordEvent(
                eq("ROLE_ASSIGN"),
                eq("User"),
                eq("10"),
                eq("admin_user"),
                eq("SUCCESS"),
                eq("10.0.0.1"),
                contains("Mentor lavozimiga tayinlandi"),
                any()
        );
    }

    @Test
    @DisplayName("4. Audit jurnallarida maxfiy ma'lumotlarni yashirish (Sensitive-field redaction)")
    void testAuditRedaction() {
        AuditService service = new AuditService(auditLogRepository);

        String rawDetails = "Foydalanuvchi yaratildi: password=SuperSecretPassword123, email=test@axm.uz, token=eyJhbGciOiJIUzI1NiJ9";
        String redacted = service.redactSensitiveInfo(rawDetails);

        assertThat(redacted).doesNotContain("SuperSecretPassword123");
        assertThat(redacted).doesNotContain("eyJhbGciOiJIUzI1NiJ9");
        assertThat(redacted).contains("[REDACTED]");
    }

    @Test
    @DisplayName("5. Audit eksporti qilinganda REPORT_EXPORT audit voqeasi qayd etilishi")
    void testAuditExport_GeneratesAuditRecord() {
        AuditService service = new AuditService(auditLogRepository);
        when(auditLogRepository.findTop50ByOrderByCreatedAtDesc()).thenReturn(List.of());
        when(auditLogRepository.save(any(AuditLog.class))).thenAnswer(i -> i.getArgument(0));

        byte[] exportBytes = service.exportAuditLogs("csv", "compliance_officer", "192.168.0.5");

        assertThat(exportBytes).isNotEmpty();
        verify(auditLogRepository).save(argThat(log ->
                "REPORT_EXPORT".equals(log.getAction()) &&
                "compliance_officer".equals(log.getPerformedBy())
        ));
    }

    @Test
    @DisplayName("6. Infratuzilma salomatligi diagnostikasi (Operational health overview)")
    void testGetOperationalHealth() throws Exception {
        Connection mockConn = mock(Connection.class);
        when(dataSource.getConnection()).thenReturn(mockConn);
        when(mockConn.isValid(2)).thenReturn(true);

        OperationalHealthDto health = adminOperationsService.getOperationalHealth();

        assertThat(health.getStatus()).isEqualTo("UP");
        assertThat(health.getDatabaseStatus()).isEqualTo("CONNECTED");
        assertThat(health.getTotalJvmMemoryMb()).isGreaterThan(0);
        assertThat(health.getAvailableProcessors()).isGreaterThan(0);
    }
}
