package uz.axm.nexus.ai.domain.assistant;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ConvertLessonDraftRequest {
    private AiLessonPlanDetailsDto details;
    private Long mentorId;
    private Long groupId;
}
