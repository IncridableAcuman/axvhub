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
public class AiBroadcastRequest {
    @NotBlank(message = "E'lon mavzusi yoki qisqacha mazmuni kiritilishi shart")
    private String topic;

    private String targetRole; // e.g. "ROLE_STUDENT", "ROLE_MENTOR", or null/empty for all
    @Builder.Default
    private boolean sendEmail = false;
    private String customApiKey;
}
