package uz.axm.nexus.analytics.domain;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DashboardOverviewDto {
    private Integer totalStudents;
    private Integer totalMentors;
    private Integer activeGroups;
    private Double systemWideAttendanceRate;
    private Double systemWideAverageScore;
    private Integer totalCompletedLessons;
    private Integer totalSubmittedAssignments;
    private Integer totalEvaluatedAssessments;
    private List<GroupComparisonDto> groupComparisons;
    private List<TrendDataPointDto> systemTrend;
    private MetricRuleDocumentationDto ruleDocumentation;
}
