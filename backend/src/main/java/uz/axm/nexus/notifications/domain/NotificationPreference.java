package uz.axm.nexus.notifications.domain;

import jakarta.persistence.*;
import lombok.*;
import uz.axm.nexus.shared.domain.BaseEntity;

@Entity
@Table(name = "notification_preferences")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class NotificationPreference extends BaseEntity {

    @Column(name = "user_id", nullable = false, unique = true)
    private Long userId;

    @Builder.Default
    @Column(name = "in_app_enabled", nullable = false)
    private boolean inAppEnabled = true;

    @Builder.Default
    @Column(name = "email_enabled", nullable = false)
    private boolean emailEnabled = true;

    @Builder.Default
    @Column(name = "lesson_alerts", nullable = false)
    private boolean lessonAlerts = true;

    @Builder.Default
    @Column(name = "assignment_alerts", nullable = false)
    private boolean assignmentAlerts = true;

    @Builder.Default
    @Column(name = "assessment_alerts", nullable = false)
    private boolean assessmentAlerts = true;

    @Builder.Default
    @Column(name = "announcement_alerts", nullable = false)
    private boolean announcementAlerts = true;

    @Builder.Default
    @Column(name = "digest_frequency", nullable = false, length = 20)
    private String digestFrequency = "INSTANT"; // INSTANT, DAILY, OFF
}
