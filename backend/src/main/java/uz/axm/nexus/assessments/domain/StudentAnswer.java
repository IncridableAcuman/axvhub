package uz.axm.nexus.assessments.domain;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "student_answers", uniqueConstraints = {
        @UniqueConstraint(name = "uk_attempt_question", columnNames = {"attempt_id", "question_id"})
})
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class StudentAnswer {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "attempt_id", nullable = false)
    private Long attemptId;

    @Column(name = "question_id", nullable = false)
    private Long questionId;

    @Column(name = "student_answer_text", columnDefinition = "TEXT")
    private String studentAnswerText;

    @Column(name = "selected_options_json", columnDefinition = "TEXT")
    private String selectedOptionsJson;

    @Column(name = "earned_points")
    @Builder.Default
    private Integer earnedPoints = 0;

    @Column(name = "is_correct")
    private Boolean isCorrect;

    @Column(name = "mentor_feedback", columnDefinition = "TEXT")
    private String mentorFeedback;
}
