package uz.axm.nexus.lessons.domain;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "student_lesson_progress", uniqueConstraints = {
        @UniqueConstraint(name = "uk_lesson_student", columnNames = {"lesson_id", "student_id"})
})
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class StudentLessonProgress {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "lesson_id", nullable = false)
    private Long lessonId;

    @Column(name = "student_id", nullable = false)
    private Long studentId;

    @Column(nullable = false)
    @Builder.Default
    private String status = "ATTENDED"; // ATTENDED, PRACTICAL_SUBMITTED, HOMEWORK_SUBMITTED, COMPLETED

    @Builder.Default
    private Integer score = 0;

    @Column(name = "mentor_feedback", columnDefinition = "TEXT")
    private String mentorFeedback;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @PrePersist
    @PreUpdate
    public void onUpdate() {
        this.updatedAt = LocalDateTime.now();
    }
}
