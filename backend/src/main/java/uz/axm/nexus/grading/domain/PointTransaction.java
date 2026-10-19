package uz.axm.nexus.grading.domain;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "point_transactions")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PointTransaction {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "student_id", nullable = false)
    private Long studentId;

    @Column(nullable = false)
    private Integer amount; // can be positive or negative for adjustments

    @Column(name = "point_source", nullable = false)
    private String pointSource; // ASSESSMENT, PRACTICAL_ASSIGNMENT, HOMEWORK, CLASSROOM_ACTIVITY, MENTOR_BONUS, ATTENDANCE_STREAK, ACHIEVEMENT_UNLOCKED, ADJUSTMENT

    @Column(name = "reference_id")
    private String referenceId;

    @Column(name = "reference_type")
    private String referenceType;

    @Column(name = "idempotency_key", unique = true)
    private String idempotencyKey; // Prevents duplicate point awards

    @Column(nullable = false)
    private String reason;

    @Column(name = "awarded_by_user_id")
    private Long awardedByUserId;

    @Column(name = "created_at", nullable = false, updatable = false)
    @Builder.Default
    private LocalDateTime createdAt = LocalDateTime.now();
}
