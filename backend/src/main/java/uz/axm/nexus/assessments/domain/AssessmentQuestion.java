package uz.axm.nexus.assessments.domain;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "assessment_questions")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AssessmentQuestion {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "assessment_id", nullable = false)
    private Long assessmentId;

    @Column(name = "question_text", columnDefinition = "TEXT", nullable = false)
    private String questionText;

    @Column(name = "question_type", nullable = false)
    private String questionType; // SINGLE_CHOICE, MULTIPLE_CHOICE, TRUE_FALSE, SHORT_TEXT, PRACTICAL

    @Column(nullable = false)
    @Builder.Default
    private Integer points = 10;

    @Column(name = "order_index", nullable = false)
    @Builder.Default
    private Integer orderIndex = 0;

    @Column(name = "options_json", columnDefinition = "TEXT")
    private String optionsJson; // JSON array of options

    @Column(name = "correct_answers_json", columnDefinition = "TEXT")
    private String correctAnswersJson; // JSON array of correct indices or answer string

    @Column(columnDefinition = "TEXT")
    private String explanation;
}
