package uz.axm.nexus.lessons.domain;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "lesson_quality_plans")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class LessonQualityPlan {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "lesson_id", nullable = false, unique = true)
    private Long lessonId;

    @Column(name = "learning_objectives", columnDefinition = "TEXT")
    private String learningObjectives; // JSON or formatted text of objectives

    @Column(name = "expected_competencies", columnDefinition = "TEXT")
    private String expectedCompetencies;

    @Column(name = "required_prior_knowledge", columnDefinition = "TEXT")
    private String requiredPriorKnowledge;

    @Column(name = "theory_duration_minutes")
    @Builder.Default
    private Integer theoryDurationMinutes = 20;

    @Column(name = "practical_duration_minutes")
    @Builder.Default
    private Integer practicalDurationMinutes = 30;

    @Column(name = "teaching_methods", columnDefinition = "TEXT")
    private String teachingMethods;

    @Column(name = "required_materials", columnDefinition = "TEXT")
    private String requiredMaterials;

    @Column(name = "assessment_criteria", columnDefinition = "TEXT")
    private String assessmentCriteria;

    @Column(name = "expected_student_outcomes", columnDefinition = "TEXT")
    private String expectedStudentOutcomes;

    @Column(name = "created_at")
    @Builder.Default
    private LocalDateTime createdAt = LocalDateTime.now();

    @Column(name = "updated_at")
    @Builder.Default
    private LocalDateTime updatedAt = LocalDateTime.now();
}
