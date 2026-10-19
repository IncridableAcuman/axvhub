package uz.axm.nexus.ai.domain.assistant;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AiPromptRequest {
    private String userPrompt;
    private AiRole role;
    private AiIntent intent;
    private String subject;
    private String gradeLevel; // "8-sinf", "9-sinf", "10-sinf", "11-sinf"
    private String topic;
    @Builder.Default
    private String language = "uz"; // "uz", "ru", "en"
    private String contextData;
    private Long targetGroupId;
    private String customApiKey;
}
