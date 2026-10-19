package uz.axm.nexus.analytics.domain;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;
import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class GroupAnalyticsDto {
    private Long groupId;
    private String groupCode;
    private String gradeLevel;
    private String subject;
    private String mentorName;
    private String branchLocation;
    private Integer studentCount;

    // Aggregate metrics
    private Double averageAttendanceRate;
    private Double averageAssessmentScore;
    private Double averageAssignmentCompletionRate;
    private Integer totalLessonsConducted;
    private Integer totalLessonsPlanned;
    private Double lessonCompletionRate;

    // Grade distribution: "A" (90-100), "B" (80-89), "C" (70-79), "D" (60-69), "F" (<60)
    private Map<String, Integer> scoreDistribution;

    // Student performance rows
    private List<StudentPerformanceSummaryDto> students;

    // Trend over time
    private List<TrendDataPointDto> weeklyTrend;

    // Rules Transparency
    private MetricRuleDocumentationDto ruleDocumentation;
}
