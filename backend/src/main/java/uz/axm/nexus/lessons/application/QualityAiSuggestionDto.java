package uz.axm.nexus.lessons.application;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class QualityAiSuggestionDto {
    private Long lessonId;
    private String topic;
    private boolean isAdvisory; // Mandatory advisory flag
    private String disclaimer;
    private List<String> alternativeExplanations;
    private List<String> additionalPracticalExercises;
    private List<String> revisionActivities;
    private List<String> lessonPlanImprovements;
}
