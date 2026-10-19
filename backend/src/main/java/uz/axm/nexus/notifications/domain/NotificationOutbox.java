package uz.axm.nexus.notifications.domain;

import jakarta.persistence.*;
import lombok.*;
import uz.axm.nexus.shared.domain.BaseEntity;

import java.time.LocalDateTime;

@Entity
@Table(name = "notification_outbox")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class NotificationOutbox extends BaseEntity {

    @Column(name = "notification_id")
    private Long notificationId;

    @Builder.Default
    @Column(nullable = false, length = 20)
    private String channel = "EMAIL"; // EMAIL, IN_APP

    @Column(nullable = false)
    private String recipient;

    @Column(nullable = false)
    private String subject;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String payload;

    @Builder.Default
    @Column(nullable = false, length = 20)
    private String status = "PENDING"; // PENDING, SENT, FAILED

    @Builder.Default
    @Column(nullable = false)
    private int attempts = 0;

    @Column(name = "last_attempt_at")
    private LocalDateTime lastAttemptAt;

    @Column(name = "error_message", columnDefinition = "TEXT")
    private String errorMessage;
}
