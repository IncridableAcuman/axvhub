package uz.axm.nexus.grading.domain;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "student_achievements", uniqueConstraints = {
        @UniqueConstraint(name = "uk_student_achievement", columnNames = {"student_id", "achievement_id"})
})
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class StudentAchievement {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "student_id", nullable = false)
    private Long studentId;

    @Column(name = "achievement_id", nullable = false)
    private Long achievementId;

    @Column(name = "unlocked_at", nullable = false)
    @Builder.Default
    private LocalDateTime unlockedAt = LocalDateTime.now();

    @Column(name = "progress_value")
    @Builder.Default
    private Integer progressValue = 0;
}
