package uz.axm.nexus.ai.domain.assistant;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AiLessonPlanDetailsDto {
    private String title;
    private String subject;
    private String gradeLevel;
    private String topic;
    private String learningObjectives;
    private String expectedOutcomes;
    private String requiredMaterials;
    private String theoryContent;
    @Builder.Default
    private Integer theoryDurationMinutes = 20;
    private String practicalContent;
    @Builder.Default
    private Integer practicalDurationMinutes = 25;
    private String exercises;
    private String homework;
    @Builder.Default
    private Integer durationMinutes = 80;
}
