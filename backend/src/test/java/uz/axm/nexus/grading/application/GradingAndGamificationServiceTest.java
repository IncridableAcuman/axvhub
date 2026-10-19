package uz.axm.nexus.grading.application;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import uz.axm.nexus.grading.domain.PointTransaction;
import uz.axm.nexus.grading.infrastructure.AchievementRepository;
import uz.axm.nexus.grading.infrastructure.GradeRecordRepository;
import uz.axm.nexus.grading.infrastructure.PointTransactionRepository;
import uz.axm.nexus.grading.infrastructure.StudentAchievementRepository;
import uz.axm.nexus.users.infrastructure.StudentRepository;

import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class GradingAndGamificationServiceTest {

    @Mock
    private GradeRecordRepository gradeRecordRepository;

    @Mock
    private PointTransactionRepository pointTransactionRepository;

    @Mock
    private AchievementRepository achievementRepository;

    @Mock
    private StudentAchievementRepository studentAchievementRepository;

    @Mock
    private StudentRepository studentRepository;

    @InjectMocks
    private GradingAndGamificationService gradingService;

    @Test
    @DisplayName("Takroriy idempotency key bilan murojaat qilinganda qayta ball berilmasligi kerak")
    void shouldPreventDuplicatePointAwardsWithIdempotency() {
        PointTransaction existingTx = PointTransaction.builder()
                .id(1L)
                .studentId(10L)
                .amount(50)
                .idempotencyKey("assessment_attempt_55")
                .reason("Test topshirildi")
                .build();

        when(pointTransactionRepository.findByIdempotencyKey("assessment_attempt_55"))
                .thenReturn(Optional.of(existingTx));

        PointTransaction result = gradingService.awardPoints(
                10L, 50, "ASSESSMENT", "55", "Attempt", "assessment_attempt_55", "Test topshirildi", 1L
        );

        assertThat(result.getId()).isEqualTo(1L);
        // Verify save was NOT called again
        verify(pointTransactionRepository, never()).save(any(PointTransaction.class));
    }

    @Test
    @DisplayName("Ball berishda asoslovchi sabab (reason) bo'lmasa rad etilishi kerak")
    void shouldRequireReasonForPointAward() {
        assertThatThrownBy(() -> gradingService.awardPoints(10L, 50, "BONUS", null, null, "k1", "", 1L))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("aniq sabab");
    }

    @Test
    @DisplayName("Ballni qo'lda to'g'rilash (Adjustment) batafsil izoh talab qilishi kerak")
    void shouldRequireDetailedExplanationForAdjustment() {
        assertThatThrownBy(() -> gradingService.recordAdjustment(10L, -20, "xato", 1L))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("batafsil izoh");
    }
}
