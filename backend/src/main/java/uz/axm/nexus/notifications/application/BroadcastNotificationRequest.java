package uz.axm.nexus.notifications.application;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BroadcastNotificationRequest {
    @NotBlank(message = "Sarlavha bo'sh bo'lishi mumkin emas")
    private String title;

    @NotBlank(message = "Xabar matni bo'sh bo'lishi mumkin emas")
    private String message;

    private String targetRole; // e.g., ROLE_STUDENT, ROLE_MENTOR, or null for all

    private List<Long> specificUserIds;

    private String actionUrl;

    @Builder.Default
    private Boolean sendEmail = false;

    public boolean isSendEmail() {
        return Boolean.TRUE.equals(sendEmail);
    }
}
