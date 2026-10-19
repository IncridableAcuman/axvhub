package uz.axm.nexus.ai.domain.assistant;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "ai_interaction_logs")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AiInteractionLog {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "user_id")
    private Long userId;

    @Column(nullable = false, length = 50)
    private String provider;

    @Column(length = 100)
    private String model;

    @Column(name = "user_role", length = 50)
    private String userRole;

    @Column(nullable = false, length = 100)
    private String intent;

    @Column(name = "target_grade_level", length = 50)
    private String targetGradeLevel;

    @Column(name = "target_subject", length = 100)
    private String targetSubject;

    @Column(name = "prompt_length")
    private Integer promptLength;

    @Column(name = "response_length")
    private Integer responseLength;

    @Column(name = "duration_ms")
    private Long durationMs;

    @Column(nullable = false, length = 50)
    @Builder.Default
    private String status = "SUCCESS";

    @Column(name = "error_message", columnDefinition = "TEXT")
    private String errorMessage;

    @Column(name = "created_at", nullable = false, updatable = false)
    @Builder.Default
    private LocalDateTime createdAt = LocalDateTime.now();
}
