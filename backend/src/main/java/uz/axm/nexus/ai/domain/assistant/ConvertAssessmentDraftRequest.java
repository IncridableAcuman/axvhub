package uz.axm.nexus.ai.domain.assistant;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ConvertAssessmentDraftRequest {
    private String title;
    private String subject;
    private String gradeLevel;
    private Long groupId;
    private Long mentorId;
    private List<AiQuizQuestionDto> questions;
}
