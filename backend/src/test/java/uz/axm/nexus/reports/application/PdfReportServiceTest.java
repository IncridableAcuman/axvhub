package uz.axm.nexus.reports.application;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import uz.axm.nexus.analytics.application.AnalyticsAuthorizationService;
import uz.axm.nexus.analytics.application.AnalyticsService;
import uz.axm.nexus.analytics.domain.*;
import uz.axm.nexus.users.application.StudentService;
import uz.axm.nexus.users.domain.User;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class PdfReportServiceTest {

    @Mock
    private AnalyticsService analyticsService;
    @Mock
    private StudentService studentService;
    @Mock
    private AnalyticsAuthorizationService authorizationService;

    @InjectMocks
    private PdfReportService pdfReportService;

    private User adminUser;

    @BeforeEach
    void setUp() {
        adminUser = User.builder()
                .username("admin")
                .fullName("Administrator")
                .role("ROLE_SUPER_ADMIN")
                .build();
        adminUser.setId(1L);
    }

    @Test
    @DisplayName("Shaxsiy o'quvchi hisoboti: To'g'ri PDF baytlari (%PDF-...) yaratilishi kerak")
    void shouldGenerateIndividualStudentPdf() {
        IndividualStudentAnalyticsDto dto = IndividualStudentAnalyticsDto.builder()
                .studentId(100L)
                .studentName("Gulnora Shamuratova")
                .studentIdNumber("I-HR 0220201")
                .gradeLevel("8-sinf")
                .groupCode("YA-26I0804")
                .mentorName("Izzatbek Abdurasharipov")
                .branchLocation("IT Park Yangiariq")
                .completedLessonsCount(8)
                .attendanceRate(95.5)
                .totalScheduledSessions(10)
                .presentCount(9)
                .lateCount(1)
                .excusedCount(0)
                .absentCount(0)
                .totalAssessmentsAssigned(3)
                .assessmentsAttempted(3)
                .assessmentCompletionRate(100.0)
                .averageAssessmentScore(88.0)
                .totalAssignmentsAssigned(2)
                .assignmentsSubmitted(2)
                .assignmentCompletionRate(100.0)
                .averageAssignmentScore(92.0)
                .overallAverageScore(90.0)
                .masteryLevel("A'lo (90-100%)")
                .ruleDocumentation(MetricRuleDocumentationDto.getDefault())
                .build();

        when(analyticsService.getIndividualStudentAnalytics(eq(100L), any(), any(), eq(adminUser)))
                .thenReturn(dto);

        byte[] pdfBytes = pdfReportService.generateIndividualStudentReport(100L, LocalDate.now().minusDays(30), LocalDate.now(), adminUser);

        assertThat(pdfBytes).isNotNull();
        assertThat(pdfBytes.length).isGreaterThan(1000);
        // Valid PDF magic header bytes "%PDF"
        assertThat(new String(pdfBytes, 0, 4)).isEqualTo("%PDF");
    }

    @Test
    @DisplayName("Guruh hisoboti PDF formatida muvaffaqiyatli shakllanishi kerak")
    void shouldGenerateGroupPerformancePdf() {
        GroupAnalyticsDto dto = GroupAnalyticsDto.builder()
                .groupId(10L)
                .groupCode("YA-26I0804")
                .gradeLevel("8-sinf")
                .subject("Web Full-Stack")
                .mentorName("Izzatbek")
                .studentCount(7)
                .averageAttendanceRate(94.0)
                .averageAssessmentScore(85.5)
                .averageAssignmentCompletionRate(90.0)
                .totalLessonsConducted(12)
                .totalLessonsPlanned(14)
                .lessonCompletionRate(85.7)
                .scoreDistribution(Map.of("A", 3, "B", 4))
                .students(List.of(StudentPerformanceSummaryDto.builder()
                        .studentId(100L)
                        .studentName("Gulnora Shamuratova")
                        .attendanceRate(95.0)
                        .averageScore(90.0)
                        .completedLessons(8)
                        .submittedAssignments(2)
                        .masteryLevel("A'lo")
                        .build()))
                .ruleDocumentation(MetricRuleDocumentationDto.getDefault())
                .build();

        when(analyticsService.getGroupAnalytics(eq(10L), any(), any(), eq(adminUser)))
                .thenReturn(dto);

        byte[] pdfBytes = pdfReportService.generateGroupPerformanceReport(10L, null, null, adminUser);

        assertThat(pdfBytes).isNotNull();
        assertThat(pdfBytes.length).isGreaterThan(1000);
        assertThat(new String(pdfBytes, 0, 4)).isEqualTo("%PDF");
    }

    @Test
    @DisplayName("Fayl nomi sanitizatsiyasi: noxush belgilarni tozalashi kerak")
    void shouldSanitizePdfFilename() {
        String clean = PdfReportService.sanitizeFilename("report/../../evil%name: 2026");
        assertThat(clean).doesNotContain("/");
        assertThat(clean).doesNotContain("..");
        assertThat(clean).doesNotContain("%");
        assertThat(clean).doesNotContain(" ");
        assertThat(clean).endsWith(".pdf");
    }
}
