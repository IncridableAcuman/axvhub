package uz.axm.nexus.lessons;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import uz.axm.nexus.grading.infrastructure.GradeRecordRepository;
import uz.axm.nexus.lessons.application.*;
import uz.axm.nexus.lessons.domain.*;
import uz.axm.nexus.lessons.infrastructure.*;
import uz.axm.nexus.scheduling.infrastructure.AttendanceRecordRepository;
import uz.axm.nexus.users.domain.User;
import uz.axm.nexus.users.infrastructure.UserRepository;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class LessonQualityServiceTest {

    @Mock
    private LessonRepository lessonRepository;

    @Mock
    private LessonQualityPlanRepository qualityPlanRepository;

    @Mock
    private LessonDeliveryRecordRepository deliveryRecordRepository;

    @Mock
    private StudentLearningOutcomeEvaluationRepository outcomeEvaluationRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private AttendanceRecordRepository attendanceRecordRepository;

    @Mock
    private GradeRecordRepository gradeRecordRepository;

    @InjectMocks
    private LessonQualityService qualityService;

    private Lesson sampleLesson;
    private User sampleMentor;
    private User sampleStudent;

    @BeforeEach
    void setUp() {
        sampleLesson = Lesson.builder()
                .id(100L)
                .title("CSS Grid va Flexbox asoslari")
                .subject("Web Development")
                .gradeLevel("8-sinf")
                .learningObjectives("[{\"id\": \"LO-1\", \"title\": \"CSS Grid yaratish\"}]")
                .theoryDurationMinutes(20)
                .practicalDurationMinutes(30)
                .durationMinutes(80)
                .build();

        sampleMentor = User.builder()
                .username("mentor_alisher")
                .fullName("Alisher Mentor")
                .build();
        sampleMentor.setId(10L);

        sampleStudent = User.builder()
                .username("student_rustam")
                .fullName("Rustam Axmedov")
                .build();
        sampleStudent.setId(20L);
    }

    @Test
    @DisplayName("Dars sifat rejasi (planning) muvaffaqiyatli saqlanishi va o'qilishi kerak")
    void shouldSaveAndRetrieveQualityPlan() {
        when(lessonRepository.existsById(100L)).thenReturn(true);
        when(qualityPlanRepository.findByLessonId(100L)).thenReturn(Optional.empty());

        LessonQualityPlan savedPlan = LessonQualityPlan.builder()
                .id(1L)
                .lessonId(100L)
                .learningObjectives("[{\"id\": \"LO-1\", \"title\": \"CSS Grid layout\"}]")
                .expectedCompetencies("Web sahifalarni to'r asosida joylashtirish")
                .theoryDurationMinutes(15)
                .practicalDurationMinutes(35)
                .teachingMethods("Pair Programming")
                .assessmentCriteria("Amaliyot to'liq ishlashi")
                .createdAt(LocalDateTime.now())
                .updatedAt(LocalDateTime.now())
                .build();

        when(qualityPlanRepository.save(any(LessonQualityPlan.class))).thenReturn(savedPlan);

        LessonQualityPlanDto inputDto = LessonQualityPlanDto.builder()
                .lessonId(100L)
                .learningObjectives("[{\"id\": \"LO-1\", \"title\": \"CSS Grid layout\"}]")
                .expectedCompetencies("Web sahifalarni to'r asosida joylashtirish")
                .theoryDurationMinutes(15)
                .practicalDurationMinutes(35)
                .teachingMethods("Pair Programming")
                .assessmentCriteria("Amaliyot to'liq ishlashi")
                .build();

        LessonQualityPlanDto result = qualityService.saveOrUpdateQualityPlan(inputDto);

        assertThat(result).isNotNull();
        assertThat(result.getLessonId()).isEqualTo(100L);
        assertThat(result.getPracticalDurationMinutes()).isEqualTo(35);
        verify(qualityPlanRepository, times(1)).save(any(LessonQualityPlan.class));
    }

    @Test
    @DisplayName("Dars o'tish hisoboti va mentor refleksiyasi saqlanishi kerak")
    void shouldRecordLessonDeliveryWithMentorReflection() {
        when(lessonRepository.existsById(100L)).thenReturn(true);
        when(userRepository.findByUsername("mentor_alisher")).thenReturn(Optional.of(sampleMentor));

        LessonDeliveryRecord savedRecord = LessonDeliveryRecord.builder()
                .id(5L)
                .lessonId(100L)
                .mentorId(10L)
                .actualDurationMinutes(80)
                .topicsCovered("CSS Grid container va items")
                .practicalExercisesCompleted(3)
                .commonDifficulties("grid-template-areas sintaksisi")
                .studentParticipationRate(BigDecimal.valueOf(95.00))
                .whatWorkedWell("Mini loyiha tez tushunildi")
                .needsFurtherExplanation("auto-fill vs auto-fit farqi")
                .exerciseDifficulty("BALANCED")
                .changeNextTime("Amaliyotga 5 daqiqa ko'proq vaqt berish")
                .recordedAt(LocalDateTime.now())
                .build();

        when(deliveryRecordRepository.save(any(LessonDeliveryRecord.class))).thenReturn(savedRecord);

        LessonDeliveryRecordDto inputDto = LessonDeliveryRecordDto.builder()
                .lessonId(100L)
                .actualDurationMinutes(80)
                .topicsCovered("CSS Grid container va items")
                .practicalExercisesCompleted(3)
                .commonDifficulties("grid-template-areas sintaksisi")
                .whatWorkedWell("Mini loyiha tez tushunildi")
                .needsFurtherExplanation("auto-fill vs auto-fit farqi")
                .exerciseDifficulty("BALANCED")
                .changeNextTime("Amaliyotga 5 daqiqa ko'proq vaqt berish")
                .build();

        LessonDeliveryRecordDto result = qualityService.recordLessonDelivery(inputDto, "mentor_alisher");

        assertThat(result).isNotNull();
        assertThat(result.getPracticalExercisesCompleted()).isEqualTo(3);
        assertThat(result.getExerciseDifficulty()).isEqualTo("BALANCED");
        assertThat(result.getNeedsFurtherExplanation()).contains("auto-fill");
        verify(deliveryRecordRepository, times(1)).save(any(LessonDeliveryRecord.class));
    }

    @Test
    @DisplayName("Ta'lim natijalari (Outcomes) dalil asosida baholanishi va davomat bilan chalkashtirilmasligi kerak")
    void shouldSaveOutcomeEvaluationsWithEvidence() {
        when(lessonRepository.existsById(100L)).thenReturn(true);
        when(outcomeEvaluationRepository.findByLessonIdAndStudentIdAndObjectiveId(100L, 20L, "LO-1"))
                .thenReturn(Optional.empty());

        StudentLearningOutcomeEvaluation savedEval = StudentLearningOutcomeEvaluation.builder()
                .id(12L)
                .lessonId(100L)
                .studentId(20L)
                .objectiveId("LO-1")
                .objectiveTitle("CSS Grid layout tuzish")
                .status(OutcomeStatus.ACHIEVED)
                .evidenceSource(EvidenceSource.QUIZ_RESULT)
                .evidenceScore(BigDecimal.valueOf(90.00))
                .mentorNotes("Mashqni to'liq mustaqil bajardi")
                .evaluatedBy("mentor_alisher")
                .evaluatedAt(LocalDateTime.now())
                .build();

        when(outcomeEvaluationRepository.save(any(StudentLearningOutcomeEvaluation.class))).thenReturn(savedEval);
        when(userRepository.findById(20L)).thenReturn(Optional.of(sampleStudent));

        OutcomeEvaluationDto evalDto = OutcomeEvaluationDto.builder()
                .studentId(20L)
                .objectiveId("LO-1")
                .objectiveTitle("CSS Grid layout tuzish")
                .status(OutcomeStatus.ACHIEVED)
                .evidenceSource(EvidenceSource.QUIZ_RESULT)
                .evidenceScore(BigDecimal.valueOf(90.00))
                .mentorNotes("Mashqni to'liq mustaqil bajardi")
                .build();

        BatchOutcomeEvaluationRequest request = BatchOutcomeEvaluationRequest.builder()
                .lessonId(100L)
                .evaluations(List.of(evalDto))
                .build();

        List<OutcomeEvaluationDto> results = qualityService.saveOutcomeEvaluations(request, "mentor_alisher");

        assertThat(results).hasSize(1);
        assertThat(results.get(0).getStatus()).isEqualTo(OutcomeStatus.ACHIEVED);
        assertThat(results.get(0).getEvidenceSource()).isEqualTo(EvidenceSource.QUIZ_RESULT);
        assertThat(results.get(0).getEvidenceScore()).isEqualTo(BigDecimal.valueOf(90.00));
    }

    @Test
    @DisplayName("AI tavsiyalari maslahat xarakterida (isAdvisory=true) va disclaimer bilan qaytishi kerak")
    void shouldGenerateAdvisoryAiSuggestionsWithDisclaimer() {
        when(lessonRepository.findById(100L)).thenReturn(Optional.of(sampleLesson));
        when(deliveryRecordRepository.findFirstByLessonIdOrderByRecordedAtDesc(100L)).thenReturn(Optional.empty());

        QualityAiSuggestionDto suggestions = qualityService.generateQualityAiSuggestions(100L);

        assertThat(suggestions).isNotNull();
        assertThat(suggestions.isAdvisory()).isTrue();
        assertThat(suggestions.getDisclaimer()).contains("mentor tomonidan ko'rib chiqilishi shart");
        assertThat(suggestions.getAlternativeExplanations()).isNotEmpty();
        assertThat(suggestions.getAdditionalPracticalExercises()).isNotEmpty();
        assertThat(suggestions.getLessonPlanImprovements()).isNotEmpty();
    }

    @Test
    @DisplayName("Analitika davomat, test ballari va mentor natijalarini alohida-alohida ajratib ko'rsatishi kerak")
    void shouldProvideDistinctOutcomeAnalyticsDifferentiatingAttendanceAndObservations() {
        when(userRepository.findById(20L)).thenReturn(Optional.of(sampleStudent));

        StudentLearningOutcomeEvaluation eval1 = StudentLearningOutcomeEvaluation.builder()
                .objectiveId("LO-1")
                .objectiveTitle("CSS Grid")
                .status(OutcomeStatus.ACHIEVED)
                .evidenceScore(BigDecimal.valueOf(90.00))
                .build();

        StudentLearningOutcomeEvaluation eval2 = StudentLearningOutcomeEvaluation.builder()
                .objectiveId("LO-2")
                .objectiveTitle("Flexbox")
                .status(OutcomeStatus.DEVELOPING)
                .evidenceScore(BigDecimal.valueOf(70.00))
                .build();

        when(outcomeEvaluationRepository.findByStudentId(20L)).thenReturn(List.of(eval1, eval2));

        OutcomeAnalyticsDto analytics = qualityService.getStudentOutcomeAnalytics(20L, 5L);

        assertThat(analytics).isNotNull();
        assertThat(analytics.getTotalObjectivesTracked()).isEqualTo(2);
        assertThat(analytics.getAchievedObjectivesCount()).isEqualTo(1);
        assertThat(analytics.getDevelopingObjectivesCount()).isEqualTo(1);
        // Ensure distinct non-aggregated metrics exist
        assertThat(analytics.getAttendancePercentage()).isNotNull();
        assertThat(analytics.getAverageAssessmentScore()).isNotNull();
        assertThat(analytics.getMentorObservationAverage()).isEqualTo(BigDecimal.valueOf(80.0).setScale(1));
    }
}
