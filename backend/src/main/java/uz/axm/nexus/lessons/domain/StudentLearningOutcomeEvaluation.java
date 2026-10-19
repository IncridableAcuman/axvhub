package uz.axm.nexus.lessons.domain;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "student_learning_outcome_evaluations", uniqueConstraints = {
        @UniqueConstraint(name = "uk_student_lesson_objective", columnNames = {"lesson_id", "student_id", "objective_id"})
})
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class StudentLearningOutcomeEvaluation {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "lesson_id", nullable = false)
    private Long lessonId;

    @Column(name = "student_id", nullable = false)
    private Long studentId;

    @Column(name = "objective_id", nullable = false, length = 64)
    private String objectiveId;

    @Column(name = "objective_title", nullable = false)
    private String objectiveTitle;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 32)
    @Builder.Default
    private OutcomeStatus status = OutcomeStatus.NOT_EVALUATED;

    @Enumerated(EnumType.STRING)
    @Column(name = "evidence_source", nullable = false, length = 32)
    @Builder.Default
    private EvidenceSource evidenceSource = EvidenceSource.MENTOR_OBSERVATION;

    @Column(name = "evidence_score", precision = 5, scale = 2)
    private BigDecimal evidenceScore;

    @Column(name = "mentor_notes", columnDefinition = "TEXT")
    private String mentorNotes;

    @Column(name = "evaluated_by", length = 100)
    private String evaluatedBy;

    @Column(name = "evaluated_at")
    @Builder.Default
    private LocalDateTime evaluatedAt = LocalDateTime.now();
}
