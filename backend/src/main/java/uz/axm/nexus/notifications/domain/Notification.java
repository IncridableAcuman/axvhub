package uz.axm.nexus.notifications.domain;

import jakarta.persistence.*;
import lombok.*;
import uz.axm.nexus.shared.domain.BaseEntity;

import java.time.LocalDateTime;

@Entity
@Table(name = "notifications")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Notification extends BaseEntity {

    @Column(name = "recipient_user_id", nullable = false)
    private Long recipientUserId;

    @Column(nullable = false)
    private String title;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String message;

    @Column(nullable = false, length = 50)
    private String type; // LESSON_PUBLISHED, LESSON_RESCHEDULED, LESSON_REMINDER, etc.

    @Builder.Default
    @Column(name = "is_read", nullable = false)
    private boolean read = false;

    @Column(name = "read_at")
    private LocalDateTime readAt;

    @Column(name = "deduplication_key", length = 120)
    private String deduplicationKey;

    @Column(name = "action_url")
    private String actionUrl;

    @Column(columnDefinition = "TEXT")
    private String metadata;
}
