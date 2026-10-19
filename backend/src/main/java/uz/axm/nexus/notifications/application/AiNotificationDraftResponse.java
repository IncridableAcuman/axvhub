package uz.axm.nexus.notifications.application;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AiNotificationDraftResponse {
    private String title;
    private String message;
    private String type;
    private String actionUrl;
    private String providerUsed;
    private String modelUsed;
}
