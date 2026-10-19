package uz.axm.nexus.assessments.domain;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "assessments")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Assessment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String title;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(nullable = false)
    private String subject;

    @Column(name = "grade_level", nullable = false)
    private String gradeLevel;

    private String topic;

    @Column(name = "assessment_type", nullable = false)
    @Builder.Default
    private String assessmentType = "QUIZ"; // QUIZ, EXAM, PRACTICAL, HOMEWORK

    @Column(name = "total_points", nullable = false)
    @Builder.Default
    private Integer totalPoints = 100;

    @Column(name = "passing_score", nullable = false)
    @Builder.Default
    private Integer passingScore = 60;

    @Column(name = "duration_minutes")
    @Builder.Default
    private Integer durationMinutes = 45;

    @Column(name = "start_time")
    private LocalDateTime startTime;

    @Column(name = "end_time")
    private LocalDateTime endTime;

    @Column(name = "max_attempts", nullable = false)
    @Builder.Default
    private Integer maxAttempts = 1;

    @Column(name = "randomize_questions", nullable = false)
    @Builder.Default
    private Boolean randomizeQuestions = false;

    @Column(name = "show_correct_answers", nullable = false)
    @Builder.Default
    private Boolean showCorrectAnswers = false;

    @Column(name = "is_published", nullable = false)
    @Builder.Default
    private Boolean isPublished = false;

    @Column(name = "group_id")
    private Long groupId;

    @Column(name = "created_by_mentor_id")
    private Long createdByMentorId;

    @Column(name = "created_at", nullable = false, updatable = false)
    @Builder.Default
    private LocalDateTime createdAt = LocalDateTime.now();

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @PreUpdate
    public void onUpdate() {
        this.updatedAt = LocalDateTime.now();
    }
}
