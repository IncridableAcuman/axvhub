package uz.axm.nexus.notifications.application;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import uz.axm.nexus.notifications.domain.Notification;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class NotificationDto {
    private Long id;
    private Long recipientUserId;
    private String title;
    private String message;
    private String type;
    private boolean read;
    private LocalDateTime readAt;
    private String actionUrl;
    private String metadata;
    private LocalDateTime createdAt;

    public static NotificationDto fromEntity(Notification entity) {
        return NotificationDto.builder()
                .id(entity.getId())
                .recipientUserId(entity.getRecipientUserId())
                .title(entity.getTitle())
                .message(entity.getMessage())
                .type(entity.getType())
                .read(entity.isRead())
                .readAt(entity.getReadAt())
                .actionUrl(entity.getActionUrl())
                .metadata(entity.getMetadata())
                .createdAt(entity.getCreatedAt())
                .build();
    }
}
