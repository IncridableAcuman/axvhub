package uz.axm.nexus.notifications.application;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AiDailyDigestResponse {
    private String digest;
    private String urgency; // "LOW", "NORMAL", "HIGH"
    private int unreadCount;
    private LocalDateTime generatedAt;
    private String providerUsed;
}
