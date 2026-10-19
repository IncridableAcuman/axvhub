package uz.axm.nexus.lessons.application;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class OutcomeAnalyticsDto {
    private Long studentId;
    private String studentName;
    private Long groupId;
    private Integer totalObjectivesTracked;
    private Integer achievedObjectivesCount;
    private Integer developingObjectivesCount;
    private Integer introducedObjectivesCount;
    private BigDecimal masteryRatePercentage;

    // Distinct non-aggregated indicators (as explicitly required by prompt)
    private BigDecimal attendancePercentage;
    private BigDecimal averageAssessmentScore;
    private BigDecimal mentorObservationAverage;

    private Map<String, String> objectiveStatusSummary;
}
