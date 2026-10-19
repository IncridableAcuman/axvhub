package uz.axm.nexus.notifications.application;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CreateNotificationRequest {
    @NotNull(message = "Qabul qiluvchi identifikatori ko'rsatilishi shart")
    private Long recipientUserId;

    @NotBlank(message = "Sarlavha bo'sh bo'lishi mumkin emas")
    private String title;

    @NotBlank(message = "Xabar matni bo'sh bo'lishi mumkin emas")
    private String message;

    @NotBlank(message = "Xabarnoma turi ko'rsatilishi shart")
    private String type;

    private String deduplicationKey;
    private String actionUrl;
    private String metadata;
    @Builder.Default
    private Boolean sendEmail = false;

    public boolean isSendEmail() {
        return Boolean.TRUE.equals(sendEmail);
    }
}
