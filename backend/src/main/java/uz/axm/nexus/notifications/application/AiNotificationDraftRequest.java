package uz.axm.nexus.notifications.application;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AiNotificationDraftRequest {
    @NotBlank(message = "Mavzu yoki qisqacha tavsif ko'rsatilishi shart")
    private String topic;

    private String targetAudience; // e.g. "STUDENT", "MENTOR", "ALL"
    private String tone;           // e.g. "FORMAL", "ENCOURAGING", "URGENT"
    private String customApiKey;
}
