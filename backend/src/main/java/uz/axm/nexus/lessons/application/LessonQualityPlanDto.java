package uz.axm.nexus.lessons.application;

import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class LessonQualityPlanDto {
    private Long id;

    @NotNull(message = "Dars IDsi majburiy")
    private Long lessonId;

    private String learningObjectives;
    private String expectedCompetencies;
    private String requiredPriorKnowledge;
    private Integer theoryDurationMinutes;
    private Integer practicalDurationMinutes;
    private String teachingMethods;
    private String requiredMaterials;
    private String assessmentCriteria;
    private String expectedStudentOutcomes;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
