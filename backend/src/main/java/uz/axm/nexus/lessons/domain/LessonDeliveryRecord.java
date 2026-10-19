package uz.axm.nexus.lessons.domain;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "lesson_delivery_records")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class LessonDeliveryRecord {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "lesson_id", nullable = false)
    private Long lessonId;

    @Column(name = "mentor_id")
    private Long mentorId;

    @Column(name = "actual_duration_minutes")
    @Builder.Default
    private Integer actualDurationMinutes = 80;

    @Column(name = "topics_covered", columnDefinition = "TEXT")
    private String topicsCovered;

    @Column(name = "practical_exercises_completed")
    @Builder.Default
    private Integer practicalExercisesCompleted = 0;

    @Column(name = "common_difficulties", columnDefinition = "TEXT")
    private String commonDifficulties;

    @Column(name = "student_participation_rate", precision = 5, scale = 2)
    @Builder.Default
    private BigDecimal studentParticipationRate = BigDecimal.valueOf(100.00);

    @Column(name = "homework_assigned", columnDefinition = "TEXT")
    private String homeworkAssigned;

    @Column(name = "topics_requiring_revision", columnDefinition = "TEXT")
    private String topicsRequiringRevision;

    @Column(name = "what_worked_well", columnDefinition = "TEXT")
    private String whatWorkedWell;

    @Column(name = "needs_further_explanation", columnDefinition = "TEXT")
    private String needsFurtherExplanation;

    @Column(name = "exercise_difficulty", length = 30)
    @Builder.Default
    private String exerciseDifficulty = "BALANCED"; // TOO_EASY, BALANCED, TOO_DIFFICULT

    @Column(name = "change_next_time", columnDefinition = "TEXT")
    private String changeNextTime;

    @Column(name = "recorded_at")
    @Builder.Default
    private LocalDateTime recordedAt = LocalDateTime.now();
}
