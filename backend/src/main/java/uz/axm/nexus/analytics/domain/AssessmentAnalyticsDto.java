package uz.axm.nexus.analytics.domain;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AssessmentAnalyticsDto {
    private Long assessmentId;
    private String title;
    private String subject;
    private String gradeLevel;
    private String topic;
    private Integer passingScore;
    private Integer totalPoints;
    private Integer eligibleStudentsCount;
    private Integer attemptCount;
    private Double participationRate; // 0 - 100%
    private Double passRate; // 0 - 100%
    private Double averageScore; // 0 - 100%
    private Double highestScore;
    private Double lowestScore;
    private Double averageDurationMinutes;
    private Map<String, Integer> scoreRanges; // e.g. "90-100": 3, "80-89": 2, etc.
}
