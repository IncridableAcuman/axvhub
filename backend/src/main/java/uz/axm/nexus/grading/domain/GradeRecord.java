package uz.axm.nexus.grading.domain;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "grade_records")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class GradeRecord {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "student_id", nullable = false)
    private Long studentId;

    @Column(nullable = false)
    private String subject;

    @Column(name = "grade_level", nullable = false)
    private String gradeLevel;

    @Column(name = "academic_period_id")
    private Long academicPeriodId;

    @Column(name = "evaluation_type", nullable = false)
    private String evaluationType; // EXAM, QUIZ, HOMEWORK, PROJECT, FINAL

    @Column(nullable = false)
    private Integer score;

    @Column(name = "max_score", nullable = false)
    @Builder.Default
    private Integer maxScore = 100;

    @Column(name = "letter_grade")
    private String letterGrade; // A+, A, B+, B, C, D, F

    @Column(name = "is_passing", nullable = false)
    @Builder.Default
    private Boolean isPassing = true;

    @Column(columnDefinition = "TEXT")
    private String comments;

    @Column(name = "mentor_id")
    private Long mentorId;

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
